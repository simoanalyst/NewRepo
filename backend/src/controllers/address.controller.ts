import { Response } from "express";
import { z } from "zod";
import { prisma } from "@/config/db";
import { created, ok } from "@/utils/apiResponse";
import { AuthenticatedRequest } from "@/middleware/auth";
import { AppError } from "@/utils/AppError";

const addressSchema = z.object({
  label: z.string().min(1),
  recipientName: z.string().min(1),
  phone: z.string().min(9),
  county: z.string().min(1),
  town: z.string().min(1),
  estate: z.string().optional(),
  street: z.string().optional(),
  buildingInfo: z.string().optional(),
  isDefault: z.boolean().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export async function listAddresses(req: AuthenticatedRequest, res: Response) {
  const addresses = await prisma.address.findMany({
    where: { userId: req.user!.userId },
    orderBy: { isDefault: "desc" },
  });
  return ok(res, addresses);
}

export async function createAddress(req: AuthenticatedRequest, res: Response) {
  const input = addressSchema.parse(req.body);
  if (input.isDefault) {
    await prisma.address.updateMany({ where: { userId: req.user!.userId }, data: { isDefault: false } });
  }
  const address = await prisma.address.create({ data: { ...input, userId: req.user!.userId } });
  return created(res, address);
}

export async function updateAddress(req: AuthenticatedRequest, res: Response) {
  const existing = await prisma.address.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.userId !== req.user!.userId) throw new AppError(404, "Address not found");

  const input = addressSchema.partial().parse(req.body);
  if (input.isDefault) {
    await prisma.address.updateMany({ where: { userId: req.user!.userId }, data: { isDefault: false } });
  }
  const address = await prisma.address.update({ where: { id: existing.id }, data: input });
  return ok(res, address);
}

export async function deleteAddress(req: AuthenticatedRequest, res: Response) {
  const existing = await prisma.address.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.userId !== req.user!.userId) throw new AppError(404, "Address not found");

  await prisma.address.delete({ where: { id: existing.id } });
  return ok(res, { deleted: true });
}
