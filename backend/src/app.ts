import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import { env } from "@/config/env";
import { errorHandler, notFoundHandler } from "@/middleware/errorHandler";
import { apiRateLimiter } from "@/middleware/rateLimiter";

import authRoutes from "@/routes/auth.routes";
import productRoutes from "@/routes/product.routes";
import categoryRoutes from "@/routes/category.routes";
import { cartRouter, wishlistRouter } from "@/routes/cart.routes";
import orderRoutes from "@/routes/order.routes";
import paymentRoutes from "@/routes/payment.routes";
import reviewRoutes from "@/routes/review.routes";
import addressRoutes from "@/routes/address.routes";
import adminRoutes from "@/routes/admin.routes";
import { bannersRouter, couponsRouter } from "@/routes/promo.routes";
import { appointmentsRouter, contactRouter, newsletterRouter, storesRouter } from "@/routes/misc.routes";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use("/api", apiRateLimiter);

app.get("/health", (_req, res) => res.json({ status: "ok", env: env.nodeEnv }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/coupons", couponsRouter);
app.use("/api/banners", bannersRouter);
app.use("/api/stores", storesRouter);
app.use("/api/appointments", appointmentsRouter);
app.use("/api/newsletter", newsletterRouter);
app.use("/api/contact", contactRouter);

app.use(notFoundHandler);
app.use(errorHandler);
