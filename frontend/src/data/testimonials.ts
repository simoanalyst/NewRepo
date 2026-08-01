import { Testimonial } from "@/types";

const avatar = (seed: string) => `https://placehold.co/160x160/1a1a1a/e0bd71?text=${encodeURIComponent(seed)}`;

export const testimonials: Testimonial[] = [
  { id: "t1", name: "Wanjiku M.", location: "Nairobi", rating: 5, comment: "The engagement ring exceeded every expectation. Ordering was seamless and payment via M-Pesa took seconds. My fiancée cried happy tears!", avatarUrl: avatar("WM"), productName: "Amara Solitaire Engagement Ring" },
  { id: "t2", name: "Kevin O.", location: "Kisumu", rating: 5, comment: "Fast delivery to Kisumu, beautifully packaged, and the quality is genuinely premium. Customer support on WhatsApp was incredibly responsive.", avatarUrl: avatar("KO"), productName: "Askari Chronograph Watch" },
  { id: "t3", name: "Fatuma A.", location: "Mombasa", rating: 5, comment: "I love that I could visit the Nyali showroom to try pieces before buying. The staff were patient and the necklace is stunning.", avatarUrl: avatar("FA"), productName: "Adhiambo Gold Pendant Necklace" },
  { id: "t4", name: "Brian K.", location: "Nakuru", rating: 4, comment: "Great experience overall — the personalized bracelet made a perfect birthday gift. Delivery took a day longer than expected but worth the wait.", avatarUrl: avatar("BK"), productName: "Kumbukumbu Engraved Bracelet" },
  { id: "t5", name: "Aisha N.", location: "Eldoret", rating: 5, comment: "Authentic, certified diamonds and transparent pricing in KES — no hidden charges at checkout. Highly recommend for anyone shopping for an engagement ring in Kenya.", avatarUrl: avatar("AN"), productName: "Zawadi Halo Engagement Ring" },
];
