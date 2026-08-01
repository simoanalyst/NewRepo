import { Router } from "express";
import {
  bookAppointment,
  listMyAppointments,
  listStores,
  submitContactMessage,
  subscribeNewsletter,
} from "@/controllers/misc.controller";
import { asyncHandler } from "@/middleware/asyncHandler";
import { requireAuth } from "@/middleware/auth";

const storesRouter = Router();
storesRouter.get("/", asyncHandler(listStores));

const appointmentsRouter = Router();
appointmentsRouter.use(requireAuth);
appointmentsRouter.post("/", asyncHandler(bookAppointment));
appointmentsRouter.get("/mine", asyncHandler(listMyAppointments));

const newsletterRouter = Router();
newsletterRouter.post("/subscribe", asyncHandler(subscribeNewsletter));

const contactRouter = Router();
contactRouter.post("/", asyncHandler(submitContactMessage));

export { appointmentsRouter, contactRouter, newsletterRouter, storesRouter };
