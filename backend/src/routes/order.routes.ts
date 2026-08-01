import { Router } from "express";
import {
  checkout,
  getOrderById,
  listAllOrders,
  listMyOrders,
  updateOrderStatus,
} from "@/controllers/order.controller";
import { asyncHandler } from "@/middleware/asyncHandler";
import { requireAuth, requireRole } from "@/middleware/auth";
import { paymentRateLimiter } from "@/middleware/rateLimiter";

const router = Router();
router.use(requireAuth);

router.post("/checkout", paymentRateLimiter, asyncHandler(checkout));
router.get("/mine", asyncHandler(listMyOrders));
router.get("/admin/all", requireRole("ADMIN", "MANAGER", "SUPPORT"), asyncHandler(listAllOrders));
router.get("/:id", asyncHandler(getOrderById));
router.patch("/:id/status", requireRole("ADMIN", "MANAGER"), asyncHandler(updateOrderStatus));

export default router;
