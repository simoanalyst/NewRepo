import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { sendSms } from '../services/sms.service';
import { sendEmail } from '../services/email.service';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret-key';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '24h';
const JWT_REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '7d';

function generateTokens(userId: string, role: string, phone: string, email?: string | null) {
  const payload = { userId, role, phone, email };
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES } as jwt.SignOptions);
  const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES } as jwt.SignOptions);
  return { accessToken, refreshToken };
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function normalizePhone(phone: string): string {
  if (phone.startsWith('+254')) return phone;
  if (phone.startsWith('0')) return '+254' + phone.slice(1);
  return phone;
}

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, email, password, firstName, lastName, role, county, subCounty, ward, nationalId } = req.body;
    const normalizedPhone = normalizePhone(phone);

    const existing = await prisma.user.findFirst({
      where: { OR: [{ phone: normalizedPhone }, ...(email ? [{ email }] : [])] },
    });
    if (existing) {
      res.status(409).json({ success: false, message: 'Phone or email already registered' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        phone: normalizedPhone,
        email,
        passwordHash,
        firstName,
        lastName,
        role,
        county,
        subCounty,
        ward,
        nationalId,
      },
      select: {
        id: true, phone: true, email: true, firstName: true, lastName: true,
        role: true, county: true, isVerified: true, createdAt: true,
      },
    });

    // Create role-specific profile
    if (role === 'FARMER') {
      await prisma.farmerProfile.create({ data: { userId: user.id } });
    } else if (['BUYER','WHOLESALER','RETAILER','EXPORTER'].includes(role)) {
      await prisma.buyerProfile.create({ data: { userId: user.id } });
    } else if (role === 'TRANSPORT_PROVIDER') {
      // Transport provider profile created separately
    }

    // Send OTP for phone verification
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await prisma.otpToken.create({
      data: { userId: user.id, token: otp, type: 'PHONE_VERIFY', expiresAt },
    });

    await sendSms(normalizedPhone, `MkulimaLink: Your verification code is ${otp}. Valid for 10 minutes.`);

    const { accessToken, refreshToken } = generateTokens(user.id, user.role, user.phone, user.email);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your phone number.',
      data: { user, accessToken, refreshToken },
    });
  } catch (err) {
    logger.error('Register error', err);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, password } = req.body;
    const isPhone = /^(\+254|0)[17]\d{8}$/.test(identifier);
    const normalizedId = isPhone ? normalizePhone(identifier) : identifier;

    const user = await prisma.user.findFirst({
      where: isPhone ? { phone: normalizedId } : { email: normalizedId },
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ success: false, message: 'Account has been deactivated' });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const { accessToken, refreshToken } = generateTokens(user.id, user.role, user.phone, user.email);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id, phone: user.phone, email: user.email,
          firstName: user.firstName, lastName: user.lastName,
          role: user.role, county: user.county, isVerified: user.isVerified,
          profilePhoto: user.profilePhoto,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    logger.error('Login error', err);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.json({ success: true, message: 'Logged out successfully' });
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ success: false, message: 'Refresh token required' });
      return;
    }

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || !user.isActive) {
      res.status(401).json({ success: false, message: 'Invalid refresh token' });
      return;
    }

    const tokens = generateTokens(user.id, user.role, user.phone, user.email);
    res.json({ success: true, data: tokens });
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier } = req.body;
    const isPhone = /^(\+254|0)[17]\d{8}$/.test(identifier);
    const normalizedId = isPhone ? normalizePhone(identifier) : identifier;

    const user = await prisma.user.findFirst({
      where: isPhone ? { phone: normalizedId } : { email: normalizedId },
    });

    // Always return success to prevent user enumeration
    res.json({ success: true, message: 'If the account exists, a reset code has been sent.' });

    if (!user) return;

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await prisma.otpToken.deleteMany({ where: { userId: user.id, type: 'PASSWORD_RESET' } });
    await prisma.otpToken.create({
      data: { userId: user.id, token: otp, type: 'PASSWORD_RESET', expiresAt },
    });

    if (isPhone) {
      await sendSms(user.phone, `MkulimaLink: Password reset code is ${otp}. Valid for 15 minutes.`);
    } else if (user.email) {
      await sendEmail(user.email, 'Password Reset', `Your password reset code is: ${otp}`, `<p>Your password reset code is: <strong>${otp}</strong></p>`);
    }
  } catch (err) {
    logger.error('Forgot password error', err);
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;
    const otpRecord = await prisma.otpToken.findFirst({
      where: { token, type: 'PASSWORD_RESET', used: false, expiresAt: { gt: new Date() } },
    });

    if (!otpRecord) {
      res.status(400).json({ success: false, message: 'Invalid or expired reset code' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({ where: { id: otpRecord.userId }, data: { passwordHash } });
    await prisma.otpToken.update({ where: { id: otpRecord.id }, data: { used: true } });

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    logger.error('Reset password error', err);
    res.status(500).json({ success: false, message: 'Failed to reset password' });
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;
    const otpRecord = await prisma.otpToken.findFirst({
      where: { token, type: 'EMAIL_VERIFY', used: false, expiresAt: { gt: new Date() } },
    });

    if (!otpRecord) {
      res.status(400).json({ success: false, message: 'Invalid or expired token' });
      return;
    }

    await prisma.user.update({
      where: { id: otpRecord.userId },
      data: { emailVerifiedAt: new Date() },
    });
    await prisma.otpToken.update({ where: { id: otpRecord.id }, data: { used: true } });

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (err) {
    logger.error('Verify email error', err);
    res.status(500).json({ success: false, message: 'Email verification failed' });
  }
};

export const verifyPhone = async (req: Request, res: Response): Promise<void> => {
  try {
    const { otp } = req.body;
    const userId = req.user!.userId;

    const otpRecord = await prisma.otpToken.findFirst({
      where: { userId, token: otp, type: 'PHONE_VERIFY', used: false, expiresAt: { gt: new Date() } },
    });

    if (!otpRecord) {
      res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { phoneVerifiedAt: new Date(), isVerified: true },
    });
    await prisma.otpToken.update({ where: { id: otpRecord.id }, data: { used: true } });

    res.json({ success: true, message: 'Phone verified successfully' });
  } catch (err) {
    logger.error('Verify phone error', err);
    res.status(500).json({ success: false, message: 'Phone verification failed' });
  }
};

export const sendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await prisma.otpToken.deleteMany({ where: { userId, type: 'PHONE_VERIFY' } });
    await prisma.otpToken.create({
      data: { userId, token: otp, type: 'PHONE_VERIFY', expiresAt },
    });

    await sendSms(user.phone, `MkulimaLink: Your OTP is ${otp}. Valid for 10 minutes.`);
    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (err) {
    logger.error('Send OTP error', err);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
};
