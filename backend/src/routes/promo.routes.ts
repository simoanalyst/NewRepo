import { Router } from "express";
import {
  createBanner,
  createCoupon,
  deleteBanner,
  deleteCoupon,
  listBanners,
  listCoupons,
  updateBanner,
  updateCoupon,
} from "@/controllers/promo.controller";
import { asyncHandler } from "@/middleware/asyncHandler";
import { requireAuth, requireRole } from "@/middleware/auth";

const couponsRouter = Router();
couponsRouter.get("/", requireAuth, requireRole("ADMIN", "MANAGER"), asyncHandler(listCoupons));
couponsRouter.post("/", requireAuth, requireRole("ADMIN", "MANAGER"), asyncHandler(createCoupon));
couponsRouter.patch("/:id", requireAuth, requireRole("ADMIN", "MANAGER"), asyncHandler(updateCoupon));
couponsRouter.delete("/:id", requireAuth, requireRole("ADMIN"), asyncHandler(deleteCoupon));

const bannersRouter = Router();
bannersRouter.get("/", asyncHandler(listBanners));
bannersRouter.post("/", requireAuth, requireRole("ADMIN", "MANAGER"), asyncHandler(createBanner));
bannersRouter.patch("/:id", requireAuth, requireRole("ADMIN", "MANAGER"), asyncHandler(updateBanner));
bannersRouter.delete("/:id", requireAuth, requireRole("ADMIN"), asyncHandler(deleteBanner));

export { bannersRouter, couponsRouter };
