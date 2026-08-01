import { Router } from "express";
import {
  createReview,
  listApprovedReviews,
  listPendingReviews,
  moderateReview,
} from "@/controllers/review.controller";
import { asyncHandler } from "@/middleware/asyncHandler";
import { requireAuth, requireRole } from "@/middleware/auth";

const router = Router();

router.get("/product/:productId", asyncHandler(listApprovedReviews));
router.post("/", requireAuth, asyncHandler(createReview));
router.get("/admin/pending", requireAuth, requireRole("ADMIN", "MANAGER"), asyncHandler(listPendingReviews));
router.patch("/admin/:id/moderate", requireAuth, requireRole("ADMIN", "MANAGER"), asyncHandler(moderateReview));

export default router;
