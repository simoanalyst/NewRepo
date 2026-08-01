export const FREE_DELIVERY_THRESHOLD_KES = 15_000;

const FEES: Record<string, number> = {
  STORE_PICKUP: 0,
  NATIONWIDE_DELIVERY: 400,
  SAME_DAY_DELIVERY: 800, // Nairobi & environs only
  COURIER_PARTNER: 600,
};

export function calculateDeliveryFeeKes(method: string, subtotalKes: number): number {
  if (subtotalKes >= FREE_DELIVERY_THRESHOLD_KES) return 0;
  return FEES[method] ?? 400;
}
