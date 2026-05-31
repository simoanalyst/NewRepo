import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { Prisma } from '@prisma/client';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const fields = (err.meta?.target as string[])?.join(', ');
      res.status(409).json({ success: false, message: `Duplicate value for: ${fields}` });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Record not found' });
      return;
    }
    logger.error('Prisma error', { code: err.code, meta: err.meta });
    res.status(500).json({ success: false, message: 'Database error' });
    return;
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({ success: false, message: 'Invalid data provided' });
    return;
  }

  // Multer errors
  if (err.message && err.message.includes('Only')) {
    res.status(400).json({ success: false, message: err.message });
    return;
  }

  logger.error('Unhandled error', { message: err.message, stack: err.stack });
  res.status(500).json({ success: false, message: 'Internal server error' });
};

export const notFound = (_req: Request, res: Response): void => {
  res.status(404).json({ success: false, message: 'Route not found' });
};
