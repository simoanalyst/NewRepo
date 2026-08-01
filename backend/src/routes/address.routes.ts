import { Router } from "express";
import { createAddress, deleteAddress, listAddresses, updateAddress } from "@/controllers/address.controller";
import { asyncHandler } from "@/middleware/asyncHandler";
import { requireAuth } from "@/middleware/auth";

const router = Router();
router.use(requireAuth);

router.get("/", asyncHandler(listAddresses));
router.post("/", asyncHandler(createAddress));
router.patch("/:id", asyncHandler(updateAddress));
router.delete("/:id", asyncHandler(deleteAddress));

export default router;
