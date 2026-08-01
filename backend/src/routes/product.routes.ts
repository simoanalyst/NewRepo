import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getFilterOptions,
  getProductBySlug,
  listProducts,
  updateProduct,
} from "@/controllers/product.controller";
import { asyncHandler } from "@/middleware/asyncHandler";
import { requireAuth, requireRole } from "@/middleware/auth";

const router = Router();

router.get("/", asyncHandler(listProducts));
router.get("/filters", asyncHandler(getFilterOptions));
router.get("/:slug", asyncHandler(getProductBySlug));
router.post("/", requireAuth, requireRole("ADMIN", "MANAGER"), asyncHandler(createProduct));
router.patch("/:id", requireAuth, requireRole("ADMIN", "MANAGER"), asyncHandler(updateProduct));
router.delete("/:id", requireAuth, requireRole("ADMIN"), asyncHandler(deleteProduct));

export default router;
