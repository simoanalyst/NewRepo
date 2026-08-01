import { Response } from "express";
import { z } from "zod";
import { prisma } from "@/config/db";
import { created, ok } from "@/utils/apiResponse";
import { AuthenticatedRequest } from "@/middleware/auth";
import { AppError } from "@/utils/AppError";

const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().min(1).max(2000),
  photoUrls: z.array(z.string().url()).optional(),
});

async function recalculateProductRating(productId: string) {
  const agg = await prisma.review.aggregate({
    where: { productId, isApproved: true },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.product.update({
    where: { id: productId },
    data: { avgRating: agg._avg.rating ?? 0, reviewCount: agg._count },
  });
}

export async function createReview(req: AuthenticatedRequest, res: Response) {
  const input = reviewSchema.parse(req.body);

  const purchased = await prisma.orderItem.findFirst({
    where: { productId: input.productId, order: { userId: req.user!.userId, status: { in: ["PAID", "DELIVERED", "PROCESSING", "OUT_FOR_DELIVERY", "READY_FOR_PICKUP"] } } },
  });

  const review = await prisma.review.create({
    data: {
      ...input,
      photoUrls: input.photoUrls ?? [],
      userId: req.user!.userId,
      isVerifiedPurchase: Boolean(purchased),
      isApproved: false,
    },
  });

  return created(res, review);
}

export async function listApprovedReviews(req: AuthenticatedRequest, res: Response) {
  const reviews = await prisma.review.findMany({
    where: { productId: req.params.productId, isApproved: true },
    include: { user: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: "desc" },
  });
  return ok(res, reviews);
}

export async function listPendingReviews(_req: AuthenticatedRequest, res: Response) {
  const reviews = await prisma.review.findMany({
    where: { isApproved: false },
    include: { user: { select: { firstName: true, lastName: true } }, product: { select: { name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });
  return ok(res, reviews);
}

export async function moderateReview(req: AuthenticatedRequest, res: Response) {
  const { approve } = z.object({ approve: z.boolean() }).parse(req.body);
  const review = await prisma.review.findUnique({ where: { id: req.params.id } });
  if (!review) throw new AppError(404, "Review not found");

  if (approve) {
    await prisma.review.update({ where: { id: review.id }, data: { isApproved: true } });
    await recalculateProductRating(review.productId);
  } else {
    await prisma.review.delete({ where: { id: review.id } });
  }

  return ok(res, { moderated: true });
}
