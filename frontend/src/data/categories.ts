import { Category } from "@/types";

const img = (seed: string, w = 700, h = 500) =>
  `https://placehold.co/${w}x${h}/f5efe6/1a1a1a?text=${encodeURIComponent(seed)}`;

export const categories: Category[] = [
  { id: "cat-1", name: "Engagement Rings", slug: "engagement-rings", description: "Symbols of forever, handcrafted with certified diamonds.", imageUrl: img("Engagement Rings"), isFeatured: true },
  { id: "cat-2", name: "Wedding Bands", slug: "wedding-bands", description: "Timeless bands to seal your vows.", imageUrl: img("Wedding Bands"), isFeatured: true },
  { id: "cat-3", name: "Necklaces", slug: "necklaces", description: "Statement and everyday necklaces.", imageUrl: img("Necklaces"), isFeatured: true },
  { id: "cat-4", name: "Bracelets", slug: "bracelets", description: "Elegant bracelets for every wrist.", imageUrl: img("Bracelets"), isFeatured: true },
  { id: "cat-5", name: "Earrings", slug: "earrings", description: "From subtle studs to bold hoops.", imageUrl: img("Earrings"), isFeatured: true },
  { id: "cat-6", name: "Watches", slug: "watches", description: "Precision timepieces for him and her.", imageUrl: img("Watches"), isFeatured: true },
  { id: "cat-7", name: "Men's Collection", slug: "mens-collection", description: "Bold, refined pieces for men.", imageUrl: img("Men's Collection"), isFeatured: false },
  { id: "cat-8", name: "Women's Collection", slug: "womens-collection", description: "Elegant designs for women.", imageUrl: img("Women's Collection"), isFeatured: false },
  { id: "cat-9", name: "Personalized Jewelry", slug: "personalized-jewelry", description: "Engraved and custom name pieces.", imageUrl: img("Personalized Jewelry"), isFeatured: true },
  { id: "cat-10", name: "Gift Sets", slug: "gift-sets", description: "Thoughtfully curated gifting collections.", imageUrl: img("Gift Sets"), isFeatured: false },
];
