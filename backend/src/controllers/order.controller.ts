import { Response } from "express";
import { prisma } from "@/config/db";
import { AppError } from "@/utils/AppError";
import { created, ok } from "@/utils/apiResponse";
import { AuthenticatedRequest } from "@/middleware/auth";
import { checkoutSchema } from "@/validators/order.validators";
import { calculateDeliveryFeeKes } from "@/utils/delivery";
import { generateOrderNumber } from "@/utils/password";
import { initiateStkPush } from "@/services/mpesa.service";
import { recordAudit } from "@/middleware/audit";

export async function checkout(req: AuthenticatedRequest, res: Response) {
  const input = checkoutSchema.parse(req.body);
  const userId = req.user!.userId;

  const cartItems = await prisma.cartItem.findMany({ where: { userId }, include: { product: true } });
  if (cartItems.length === 0) throw new AppError(400, "Your cart is empty");

  for (const item of cartItems) {
    if (!item.product.isAvailable || item.product.stockQuantity < item.quantity) {
      throw new AppError(400, `"${item.product.name}" no longer has sufficient stock`);
    }
  }

  const subtotalKes = cartItems.reduce((sum, i) => sum + i.product.priceKes * i.quantity, 0);

  let discountKes = 0;
  let couponId: string | undefined;
  if (input.couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: input.couponCode } });
    if (!coupon || !coupon.isActive) throw new AppError(400, "Invalid or expired coupon code");
    if (coupon.minOrderKes && subtotalKes < coupon.minOrderKes) {
      throw new AppError(400, `This coupon requires a minimum order of KES ${coupon.minOrderKes}`);
    }
    discountKes = coupon.percentOff
      ? Math.round((subtotalKes * coupon.percentOff) / 100)
      : coupon.amountOffKes ?? 0;
    couponId = coupon.id;
  }

  const deliveryFeeKes = calculateDeliveryFeeKes(input.deliveryMethod, subtotalKes);
  const totalKes = subtotalKes - discountKes + deliveryFeeKes;

  const order = await prisma.$transaction(async (tx) => {
    const createdOrder = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId,
        addressId: input.addressId,
        deliveryMethod: input.deliveryMethod,
        deliveryFeeKes,
        subtotalKes,
        discountKes,
        totalKes,
        couponId,
        notes: input.notes,
        items: {
          create: cartItems.map((i) => ({
            productId: i.productId,
            productName: i.product.name,
            skuSnapshot: i.product.sku,
            unitPriceKes: i.product.priceKes,
            quantity: i.quantity,
            totalKes: i.product.priceKes * i.quantity,
          })),
        },
        payment: {
          create: {
            method: input.paymentMethod,
            status: "PENDING",
            amountKes: totalKes,
          },
        },
      },
      include: { items: true, payment: true },
    });

    for (const item of cartItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stockQuantity: { decrement: item.quantity } },
      });
    }

    if (couponId) {
      await tx.coupon.update({ where: { id: couponId }, data: { timesRedeemed: { increment: 1 } } });
    }

    await tx.cartItem.deleteMany({ where: { userId } });

    return createdOrder;
  });

  await recordAudit({ userId, action: "CHECKOUT", entity: "Order", entityId: order.id, metadata: { totalKes } });

  // Kick off M-Pesa STK push automatically for the default Kenyan payment flow.
  if (input.paymentMethod === "MPESA_STK") {
    if (!input.phone) throw new AppError(400, "Phone number is required for M-Pesa payment");
    const stk = await initiateStkPush({
      phone: input.phone,
      amountKes: totalKes,
      orderNumber: order.orderNumber,
    });
    await prisma.payment.update({
      where: { orderId: order.id },
      data: {
        mpesaCheckoutRequestId: stk.checkoutRequestId,
        mpesaMerchantRequestId: stk.merchantRequestId,
        payerPhone: input.phone,
      },
    });
    return created(res, { order, mpesa: stk });
  }

  return created(res, { order });
}

export async function listMyOrders(req: AuthenticatedRequest, res: Response) {
  const orders = await prisma.order.findMany({
    where: { userId: req.user!.userId },
    include: { items: true, payment: true },
    orderBy: { createdAt: "desc" },
  });
  return ok(res, orders);
}

export async function getOrderById(req: AuthenticatedRequest, res: Response) {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { items: true, payment: true, address: true },
  });
  if (!order) throw new AppError(404, "Order not found");
  if (order.userId !== req.user!.userId && !["ADMIN", "MANAGER", "SUPPORT"].includes(req.user!.role)) {
    throw new AppError(403, "You do not have access to this order");
  }
  return ok(res, order);
}

export async function updateOrderStatus(req: AuthenticatedRequest, res: Response) {
  const { status, trackingNumber, courierPartner } = req.body as {
    status: string;
    trackingNumber?: string;
    courierPartner?: string;
  };
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status: status as never, trackingNumber, courierPartner },
  });
  await recordAudit({ userId: req.user?.userId, action: "UPDATE_STATUS", entity: "Order", entityId: order.id, metadata: { status } });
  return ok(res, order);
}

export async function listAllOrders(req: AuthenticatedRequest, res: Response) {
  const { status } = req.query as { status?: string };
  const orders = await prisma.order.findMany({
    where: status ? { status: status as never } : undefined,
    include: { items: true, payment: true, user: { select: { firstName: true, lastName: true, phone: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return ok(res, orders);
}
