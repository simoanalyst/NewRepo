import { z } from "zod";

export const checkoutSchema = z.object({
  addressId: z.string().optional(),
  deliveryMethod: z.enum(["STORE_PICKUP", "NATIONWIDE_DELIVERY", "SAME_DAY_DELIVERY", "COURIER_PARTNER"]),
  paymentMethod: z.enum(["MPESA_STK", "MPESA_PAYBILL", "AIRTEL_MONEY", "CARD", "CASH_ON_DELIVERY", "BANK_TRANSFER"]),
  couponCode: z.string().optional(),
  phone: z.string().min(9).optional(),
  notes: z.string().optional(),
});
