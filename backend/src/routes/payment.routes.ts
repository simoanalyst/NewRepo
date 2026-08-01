import { Router } from "express";
import { getPaymentStatus, mpesaCallback } from "@/controllers/payment.controller";
import { asyncHandler } from "@/middleware/asyncHandler";
import { requireAuth } from "@/middleware/auth";

const router = Router();

// Public — called by Safaricom Daraja servers, not by the browser.
router.post("/mpesa/callback", asyncHandler(mpesaCallback));

router.get("/:orderId/status", requireAuth, asyncHandler(getPaymentStatus));

export default router;
