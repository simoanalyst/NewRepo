import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getCategoryBySlug,
  listCategories,
  updateCategory,
} from "@/controllers/category.controller";
import { asyncHandler } from "@/middleware/asyncHandler";
import { requireAuth, requireRole } from "@/middleware/auth";

const router = Router();

router.get("/", asyncHandler(listCategories));
router.get("/:slug", asyncHandler(getCategoryBySlug));
router.post("/", requireAuth, requireRole("ADMIN", "MANAGER"), asyncHandler(createCategory));
router.patch("/:id", requireAuth, requireRole("ADMIN", "MANAGER"), asyncHandler(updateCategory));
router.delete("/:id", requireAuth, requireRole("ADMIN"), asyncHandler(deleteCategory));

export default router;
