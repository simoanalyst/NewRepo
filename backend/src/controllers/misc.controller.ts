import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@/config/db";
import { created, ok } from "@/utils/apiResponse";
import { AuthenticatedRequest } from "@/middleware/auth";

// --- Stores ---
export async function listStores(_req: Request, res: Response) {
  const stores = await prisma.store.findMany();
  return ok(res, stores);
}

// --- Appointments (in-store + virtual consultations) ---
const appointmentSchema = z.object({
  type: z.enum(["IN_STORE", "VIRTUAL_CONSULTATION"]),
  storeId: z.string().optional(),
  scheduledAt: z.string().datetime(),
  notes: z.string().optional(),
});

export async function bookAppointment(req: AuthenticatedRequest, res: Response) {
  const input = appointmentSchema.parse(req.body);
  const appointment = await prisma.appointment.create({
    data: {
      userId: req.user!.userId,
      type: input.type,
      storeId: input.storeId,
      scheduledAt: new Date(input.scheduledAt),
      notes: input.notes,
      meetingLink: input.type === "VIRTUAL_CONSULTATION" ? `https://meet.jit.si/kj-${Date.now()}` : undefined,
    },
  });
  return created(res, appointment);
}

export async function listMyAppointments(req: AuthenticatedRequest, res: Response) {
  const appointments = await prisma.appointment.findMany({
    where: { userId: req.user!.userId },
    include: { store: true },
    orderBy: { scheduledAt: "asc" },
  });
  return ok(res, appointments);
}

// --- Newsletter ---
export async function subscribeNewsletter(req: Request, res: Response) {
  const { email } = z.object({ email: z.string().email() }).parse(req.body);
  const sub = await prisma.newsletterSubscriber.upsert({
    where: { email },
    update: { isActive: true },
    create: { email },
  });
  return created(res, sub);
}

// --- Contact form ---
const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(1).max(3000),
});

export async function submitContactMessage(req: Request, res: Response) {
  const input = contactSchema.parse(req.body);
  const message = await prisma.contactMessage.create({ data: input });
  return created(res, message);
}
