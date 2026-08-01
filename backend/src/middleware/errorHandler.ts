import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "@/utils/AppError";
import { logger } from "@/utils/logger";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      details: err.flatten(),
    });
  }

  if (err instanceof AppError) {
    if (err.status >= 500) logger.error(err.message, { details: err.details });
    return res.status(err.status).json({ success: false, message: err.message, details: err.details });
  }

  logger.error("Unhandled error", { error: err instanceof Error ? err.stack : err });
  return res.status(500).json({ success: false, message: "Internal server error" });
}
