import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@/config/db";
import { created, ok } from "@/utils/apiResponse";

const couponSchema = z.object({
  code: z.string().min(1),
  description: z.string().optional(),
  percentOff: z.number().int().min(1).max(100).optional(),
  amountOffKes: z.number().int().positive().optional(),
  minOrderKes: z.number().int().nonnegative().optional(),
  maxRedemptions: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  startsAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
});

export async function listCoupons(_req: Request, res: Response) {
  return ok(res, await prisma.coupon.findMany({ orderBy: { code: "asc" } }));
}

export async function createCoupon(req: Request, res: Response) {
  const input = couponSchema.parse(req.body);
  const coupon = await prisma.coupon.create({
    data: {
      ...input,
      startsAt: input.startsAt ? new Date(input.startsAt) : undefined,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
    },
  });
  return created(res, coupon);
}

export async function updateCoupon(req: Request, res: Response) {
  const input = couponSchema.partial().parse(req.body);
  const coupon = await prisma.coupon.update({
    where: { id: req.params.id },
    data: {
      ...input,
      startsAt: input.startsAt ? new Date(input.startsAt) : undefined,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
    },
  });
  return ok(res, coupon);
}

export async function deleteCoupon(req: Request, res: Response) {
  await prisma.coupon.delete({ where: { id: req.params.id } });
  return ok(res, { deleted: true });
}

const bannerSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  imageUrl: z.string().url(),
  ctaLabel: z.string().optional(),
  ctaUrl: z.string().optional(),
  placement: z.enum(["HERO", "PROMO_STRIP", "MID_PAGE"]),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
});

export async function listBanners(req: Request, res: Response) {
  const { placement } = req.query as { placement?: string };
  const banners = await prisma.banner.findMany({
    where: { placement, isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  return ok(res, banners);
}

export async function createBanner(req: Request, res: Response) {
  const input = bannerSchema.parse(req.body);
  const banner = await prisma.banner.create({
    data: {
      ...input,
      startsAt: input.startsAt ? new Date(input.startsAt) : undefined,
      endsAt: input.endsAt ? new Date(input.endsAt) : undefined,
    },
  });
  return created(res, banner);
}

export async function updateBanner(req: Request, res: Response) {
  const input = bannerSchema.partial().parse(req.body);
  const banner = await prisma.banner.update({
    where: { id: req.params.id },
    data: {
      ...input,
      startsAt: input.startsAt ? new Date(input.startsAt) : undefined,
      endsAt: input.endsAt ? new Date(input.endsAt) : undefined,
    },
  });
  return ok(res, banner);
}

export async function deleteBanner(req: Request, res: Response) {
  await prisma.banner.delete({ where: { id: req.params.id } });
  return ok(res, { deleted: true });
}
