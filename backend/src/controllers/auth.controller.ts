import { Request, Response } from "express";
import { prisma } from "@/config/db";
import { AppError } from "@/utils/AppError";
import { created, ok } from "@/utils/apiResponse";
import { comparePassword, generateOtp, hashPassword } from "@/utils/password";
import { signAccessToken, signRefreshToken } from "@/utils/jwt";
import { loginSchema, registerSchema, verifyOtpSchema } from "@/validators/auth.validators";
import { AuthenticatedRequest } from "@/middleware/auth";
import { logger } from "@/utils/logger";

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("254") && digits.length === 12) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 10) return `+254${digits.slice(1)}`;
  return `+${digits}`;
}

function issueTokens(userId: string, role: string) {
  return {
    accessToken: signAccessToken({ userId, role }),
    refreshToken: signRefreshToken({ userId, role }),
  };
}

export async function register(req: Request, res: Response) {
  const input = registerSchema.parse(req.body);
  const phone = normalizePhone(input.phone);

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) throw new AppError(409, "An account with this phone number already exists");

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      phone,
      email: input.email,
      passwordHash,
    },
  });

  const code = generateOtp();
  await prisma.otpCode.create({
    data: {
      userId: user.id,
      code,
      purpose: "PHONE_VERIFY",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });
  // In production this triggers an SMS gateway (e.g. Africa's Talking). Logged for dev/demo visibility.
  logger.info(`OTP for ${phone}: ${code}`);

  const tokens = issueTokens(user.id, user.role);
  return created(res, {
    user: { id: user.id, firstName: user.firstName, lastName: user.lastName, phone: user.phone, role: user.role },
    ...tokens,
  });
}

export async function verifyPhone(req: Request, res: Response) {
  const input = verifyOtpSchema.parse(req.body);
  const phone = normalizePhone(input.phone);
  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) throw new AppError(404, "User not found");

  const otp = await prisma.otpCode.findFirst({
    where: { userId: user.id, code: input.code, purpose: "PHONE_VERIFY", consumed: false },
    orderBy: { createdAt: "desc" },
  });
  if (!otp || otp.expiresAt < new Date()) throw new AppError(400, "Invalid or expired verification code");

  await prisma.$transaction([
    prisma.otpCode.update({ where: { id: otp.id }, data: { consumed: true } }),
    prisma.user.update({ where: { id: user.id }, data: { phoneVerified: true } }),
  ]);

  return ok(res, { verified: true });
}

export async function login(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);
  const phone = normalizePhone(input.phone);

  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) throw new AppError(401, "Invalid phone number or password");

  const valid = await comparePassword(input.password, user.passwordHash);
  if (!valid) throw new AppError(401, "Invalid phone number or password");

  const tokens = issueTokens(user.id, user.role);
  return ok(res, {
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      email: user.email,
      role: user.role,
      phoneVerified: user.phoneVerified,
    },
    ...tokens,
  });
}

export async function me(req: AuthenticatedRequest, res: Response) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: req.user!.userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
      role: true,
      phoneVerified: true,
      avatarUrl: true,
      createdAt: true,
    },
  });
  return ok(res, user);
}
