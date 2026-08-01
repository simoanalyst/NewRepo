import { Router } from "express";
import {
  addToCart,
  addToWishlist,
  clearCart,
  getCart,
  getWishlist,
  removeCartItem,
  removeFromWishlist,
  updateCartItem,
} from "@/controllers/cart.controller";
import { asyncHandler } from "@/middleware/asyncHandler";
import { requireAuth } from "@/middleware/auth";

const cartRouter = Router();
cartRouter.use(requireAuth);
cartRouter.get("/", asyncHandler(getCart));
cartRouter.post("/items", asyncHandler(addToCart));
cartRouter.patch("/items/:itemId", asyncHandler(updateCartItem));
cartRouter.delete("/items/:itemId", asyncHandler(removeCartItem));
cartRouter.delete("/", asyncHandler(clearCart));

const wishlistRouter = Router();
wishlistRouter.use(requireAuth);
wishlistRouter.get("/", asyncHandler(getWishlist));
wishlistRouter.post("/", asyncHandler(addToWishlist));
wishlistRouter.delete("/:productId", asyncHandler(removeFromWishlist));

export { cartRouter, wishlistRouter };
