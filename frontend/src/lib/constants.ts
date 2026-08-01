export const SITE_NAME = "Kenyan Jewelry Co.";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "+254700000001";
export const FREE_DELIVERY_THRESHOLD_KES = 15_000;
export const BUSINESS_REG_NUMBER = "BN-2019/PVT-KJ-004521";
export const MPESA_PAYBILL = "400200";
export const MPESA_TILL = "5871234";

export const DELIVERY_FEES: Record<string, number> = {
  STORE_PICKUP: 0,
  NATIONWIDE_DELIVERY: 400,
  SAME_DAY_DELIVERY: 800,
  COURIER_PARTNER: 600,
};

export function buildWhatsAppLink(message: string): string {
  const digits = WHATSAPP_NUMBER.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
