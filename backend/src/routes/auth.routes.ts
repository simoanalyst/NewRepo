import { Router } from "express";
import { login, me, register, verifyPhone } from "@/controllers/auth.controller";
import { asyncHandler } from "@/middleware/asyncHandler";
import { requireAuth } from "@/middleware/auth";
import { authRateLimiter } from "@/middleware/rateLimiter";

const router = Router();

router.post("/register", authRateLimiter, asyncHandler(register));
router.post("/verify-phone", authRateLimiter, asyncHandler(verifyPhone));
router.post("/login", authRateLimiter, asyncHandler(login));
router.get("/me", requireAuth, asyncHandler(me));

export default router;
