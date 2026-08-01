import { Request, Response } from "express";
import { prisma } from "@/config/db";
import { ok } from "@/utils/apiResponse";
import { AppError } from "@/utils/AppError";
import { AuthenticatedRequest } from "@/middleware/auth";
import { MpesaCallbackBody, parseCallbackMetadata, queryStkPushStatus } from "@/services/mpesa.service";
import { sendWhatsAppMessage } from "@/services/whatsapp.service";
import { logger } from "@/utils/logger";

/** Public endpoint hit by Safaricom's Daraja platform after the customer confirms/cancels on their phone. */
export async function mpesaCallback(req: Request, res: Response) {
  const body = req.body as MpesaCallbackBody;
  const parsed = parseCallbackMetadata(body);
  logger.info("M-Pesa callback received", { parsed });

  const payment = await prisma.payment.findFirst({
    where: { mpesaCheckoutRequestId: parsed.checkoutRequestId },
    include: { order: { include: { user: true } } },
  });

  // Always ack Safaricom with 200 + ResultCode 0 regardless, per Daraja spec, so it stops retrying.
  if (!payment) {
    logger.warn("No matching payment for M-Pesa callback", { checkoutRequestId: parsed.checkoutRequestId });
    return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: parsed.success ? "SUCCESS" : "FAILED",
      mpesaReceiptNumber: parsed.mpesaReceiptNumber,
      rawCallback: body as unknown as object,
    },
  });

  if (parsed.success) {
    await prisma.order.update({ where: { id: payment.orderId }, data: { status: "PAID" } });
    const name = payment.order.user.firstName;
    await sendWhatsAppMessage(
      payment.order.user.phone,
      `Hi ${name}, we've received your M-Pesa payment (Ref: ${parsed.mpesaReceiptNumber}) for order ${payment.order.orderNumber}. Thank you for shopping with us! We'll notify you as your order is prepared.`
    );
  } else {
    await prisma.order.update({ where: { id: payment.orderId }, data: { status: "CANCELLED" } });
  }

  return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
}

export async function getPaymentStatus(req: AuthenticatedRequest, res: Response) {
  const payment = await prisma.payment.findUnique({
    where: { orderId: req.params.orderId },
    include: { order: true },
  });
  if (!payment) throw new AppError(404, "Payment not found");
  if (payment.order.userId !== req.user!.userId && !["ADMIN", "MANAGER", "SUPPORT"].includes(req.user!.role)) {
    throw new AppError(403, "Not authorized");
  }

  // If still pending and we have a checkout request id, actively poll Daraja as a fallback
  // in case the callback was delayed or missed.
  if (payment.status === "PENDING" && payment.mpesaCheckoutRequestId) {
    try {
      const result = await queryStkPushStatus(payment.mpesaCheckoutRequestId);
      if (result.ResultCode === "0" || result.ResultCode === 0) {
        await prisma.payment.update({ where: { id: payment.id }, data: { status: "SUCCESS" } });
        await prisma.order.update({ where: { id: payment.orderId }, data: { status: "PAID" } });
        payment.status = "SUCCESS";
      }
    } catch {
      // swallow — the customer can retry; webhook remains the source of truth
    }
  }

  return ok(res, { status: payment.status, orderStatus: payment.order.status });
}
