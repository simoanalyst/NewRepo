import { Review } from "@/types";

const NAMES = ["Wanjiru K.", "Kevin O.", "Fatuma A.", "Brian K.", "Aisha N.", "Grace M.", "Peter W.", "Njeri C."];
const COMMENTS = [
  "Absolutely stunning piece — exceeded my expectations in person.",
  "Fast delivery and the packaging felt so premium. Will buy again!",
  "Quality is fantastic for the price. Customer service on WhatsApp was excellent.",
  "Exactly as pictured. My partner loved it!",
  "Great craftsmanship, though delivery took a day longer than expected.",
  "The certificate of authenticity gave me total peace of mind.",
];

export function getReviewsForProduct(productId: string): Review[] {
  const seed = Number(productId.replace("p", "")) || 1;
  const count = 2 + (seed % 3);
  return Array.from({ length: count }).map((_, i) => ({
    id: `${productId}-review-${i}`,
    productId,
    userName: NAMES[(seed + i) % NAMES.length],
    rating: 4 + ((seed + i) % 2),
    comment: COMMENTS[(seed + i * 2) % COMMENTS.length],
    isVerifiedPurchase: (seed + i) % 3 !== 0,
    photoUrls: [],
    createdAt: new Date(Date.now() - (seed + i) * 8 * 24 * 60 * 60 * 1000).toISOString(),
  }));
}
