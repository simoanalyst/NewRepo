import { Response } from "express";
import { z } from "zod";
import { prisma } from "@/config/db";
import { ok } from "@/utils/apiResponse";
import { AuthenticatedRequest } from "@/middleware/auth";
import { AppError } from "@/utils/AppError";

const addItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  quantity: z.number().int().positive().default(1),
});

const updateItemSchema = z.object({
  quantity: z.number().int().positive(),
});

async function getCartForUser(userId: string) {
  return prisma.cartItem.findMany({
    where: { userId },
    include: { product: { include: { images: { take: 1, orderBy: { sortOrder: "asc" } } } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCart(req: AuthenticatedRequest, res: Response) {
  const items = await getCartForUser(req.user!.userId);
  const subtotalKes = items.reduce((sum, i) => sum + i.product.priceKes * i.quantity, 0);
  return ok(res, { items, subtotalKes, itemCount: items.reduce((n, i) => n + i.quantity, 0) });
}

export async function addToCart(req: AuthenticatedRequest, res: Response) {
  const input = addItemSchema.parse(req.body);
  const product = await prisma.product.findUnique({ where: { id: input.productId } });
  if (!product) throw new AppError(404, "Product not found");
  if (!product.isAvailable || product.stockQuantity < input.quantity) {
    throw new AppError(400, "Insufficient stock for this product");
  }

  const item = await prisma.cartItem.upsert({
    where: {
      userId_productId_variantId: {
        userId: req.user!.userId,
        productId: input.productId,
        variantId: input.variantId ?? null as unknown as string,
      },
    },
    update: { quantity: { increment: input.quantity } },
    create: {
      userId: req.user!.userId,
      productId: input.productId,
      variantId: input.variantId,
      quantity: input.quantity,
    },
  });

  return ok(res, item);
}

export async function updateCartItem(req: AuthenticatedRequest, res: Response) {
  const input = updateItemSchema.parse(req.body);
  const item = await prisma.cartItem.findUnique({ where: { id: req.params.itemId } });
  if (!item || item.userId !== req.user!.userId) throw new AppError(404, "Cart item not found");

  const updated = await prisma.cartItem.update({ where: { id: item.id }, data: { quantity: input.quantity } });
  return ok(res, updated);
}

export async function removeCartItem(req: AuthenticatedRequest, res: Response) {
  const item = await prisma.cartItem.findUnique({ where: { id: req.params.itemId } });
  if (!item || item.userId !== req.user!.userId) throw new AppError(404, "Cart item not found");

  await prisma.cartItem.delete({ where: { id: item.id } });
  return ok(res, { deleted: true });
}

export async function clearCart(req: AuthenticatedRequest, res: Response) {
  await prisma.cartItem.deleteMany({ where: { userId: req.user!.userId } });
  return ok(res, { cleared: true });
}

// --- Wishlist ---

export async function getWishlist(req: AuthenticatedRequest, res: Response) {
  const items = await prisma.wishlistItem.findMany({
    where: { userId: req.user!.userId },
    include: { product: { include: { images: { take: 1, orderBy: { sortOrder: "asc" } } } } },
    orderBy: { createdAt: "desc" },
  });
  return ok(res, items);
}

export async function addToWishlist(req: AuthenticatedRequest, res: Response) {
  const { productId } = z.object({ productId: z.string().min(1) }).parse(req.body);
  const item = await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId: req.user!.userId, productId } },
    update: {},
    create: { userId: req.user!.userId, productId },
  });
  return ok(res, item);
}

export async function removeFromWishlist(req: AuthenticatedRequest, res: Response) {
  await prisma.wishlistItem.deleteMany({ where: { userId: req.user!.userId, productId: req.params.productId } });
  return ok(res, { deleted: true });
}
