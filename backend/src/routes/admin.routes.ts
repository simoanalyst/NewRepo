import { Router } from "express";
import { getDashboardStats, listAuditLogs, listCustomers } from "@/controllers/admin.controller";
import { asyncHandler } from "@/middleware/asyncHandler";
import { requireAuth, requireRole } from "@/middleware/auth";

const router = Router();
router.use(requireAuth, requireRole("ADMIN", "MANAGER"));

router.get("/stats", asyncHandler(getDashboardStats));
router.get("/customers", asyncHandler(listCustomers));
router.get("/audit-logs", requireRole("ADMIN"), asyncHandler(listAuditLogs));

export default router;
