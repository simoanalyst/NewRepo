import { Product } from "@/types";
import { categories } from "@/data/categories";

const img = (seed: string) => `https://placehold.co/900x900/f5efe6/1a1a1a?text=${encodeURIComponent(seed)}`;

function categoryName(slug: string): string {
  return categories.find((c) => c.slug === slug)?.name ?? slug;
}

interface RawProduct extends Omit<Product, "categoryName" | "images" | "isAvailable" | "avgRating" | "reviewCount" | "warrantyMonths"> {
  images?: never;
}

const raw: RawProduct[] = [
  { id: "p1", sku: "KJ-ER-001", name: "Amara Solitaire Engagement Ring", slug: "amara-solitaire-engagement-ring", shortDescription: "Handcrafted 18k gold, GIA certified diamond.", description: "The Amara Solitaire Engagement Ring is meticulously handcrafted in 18k gold and set with a GIA-certified 0.5ct diamond. Designed in Nairobi for timeless elegance.", categorySlug: "engagement-rings", material: "18k Gold", gemstone: "Diamond", color: "Yellow Gold", ringSize: "M", priceKes: 185000, compareAtPriceKes: 220000, stockQuantity: 12, isFeatured: true, isBestSeller: true, collection: "Engagement", certification: "GIA Certified 0.5ct Diamond" },
  { id: "p2", sku: "KJ-ER-002", name: "Zawadi Halo Engagement Ring", slug: "zawadi-halo-engagement-ring", shortDescription: "Platinum halo setting, GIA certified diamond.", description: "The Zawadi Halo Engagement Ring features a brilliant 0.75ct GIA-certified diamond in a platinum halo setting — the ultimate symbol of forever.", categorySlug: "engagement-rings", material: "Platinum", gemstone: "Diamond", color: "Platinum", ringSize: "N", priceKes: 245000, stockQuantity: 6, isFeatured: true, isLimitedEdition: true, collection: "Engagement", certification: "GIA Certified 0.75ct Diamond" },
  { id: "p3", sku: "KJ-WB-001", name: "Nia Classic Wedding Band (Pair)", slug: "nia-classic-wedding-band-pair", shortDescription: "18k rose gold pair, comfort fit.", description: "The Nia Classic Wedding Band pair is crafted in 18k rose gold with a comfort-fit interior, designed to be worn every day for a lifetime.", categorySlug: "wedding-bands", material: "18k Gold", color: "Rose Gold", priceKes: 98000, stockQuantity: 20, isBestSeller: true, collection: "Wedding" },
  { id: "p4", sku: "KJ-NK-001", name: "Malaika Layered Necklace", slug: "malaika-layered-necklace", shortDescription: "Sterling silver, cubic zirconia accents.", description: "The Malaika Layered Necklace combines fine sterling silver chains with sparkling cubic zirconia accents for effortless everyday glamour.", categorySlug: "necklaces", material: "Sterling Silver", gemstone: "Cubic Zirconia", color: "Silver", priceKes: 12500, stockQuantity: 30, isNewArrival: true, collection: "Women" },
  { id: "p5", sku: "KJ-NK-002", name: "Adhiambo Gold Pendant Necklace", slug: "adhiambo-gold-pendant-necklace", shortDescription: "18k gold, genuine emerald pendant.", description: "The Adhiambo Gold Pendant Necklace showcases a genuine emerald set in warm 18k gold — a striking statement piece for special occasions.", categorySlug: "necklaces", material: "18k Gold", gemstone: "Emerald", color: "Yellow Gold", priceKes: 76000, stockQuantity: 10, isFeatured: true, collection: "Women" },
  { id: "p6", sku: "KJ-BR-001", name: "Furaha Tennis Bracelet", slug: "furaha-tennis-bracelet", shortDescription: "White gold, brilliant-cut diamonds.", description: "The Furaha Tennis Bracelet is a continuous line of brilliant-cut diamonds set in white gold — refined sparkle for every wrist.", categorySlug: "bracelets", material: "White Gold", gemstone: "Diamond", color: "White Gold", priceKes: 165000, stockQuantity: 8, isBestSeller: true, collection: "Women" },
  { id: "p7", sku: "KJ-BR-002", name: "Simba Men's Chain Bracelet", slug: "simba-mens-chain-bracelet", shortDescription: "Bold titanium chain, matte black finish.", description: "The Simba Men's Chain Bracelet is forged from durable titanium with a matte black finish — rugged elegance for the modern man.", categorySlug: "bracelets", material: "Titanium", color: "Black", priceKes: 15500, stockQuantity: 25, isNewArrival: true, collection: "Men" },
  { id: "p8", sku: "KJ-EA-001", name: "Neema Diamond Stud Earrings", slug: "neema-diamond-stud-earrings", shortDescription: "18k gold, brilliant diamond studs.", description: "The Neema Diamond Stud Earrings pair brilliant-cut diamonds with warm 18k gold settings for a classic, versatile sparkle.", categorySlug: "earrings", material: "18k Gold", gemstone: "Diamond", color: "Yellow Gold", priceKes: 54000, stockQuantity: 18, isBestSeller: true, collection: "Women" },
  { id: "p9", sku: "KJ-EA-002", name: "Chiku Gold Hoop Earrings", slug: "chiku-gold-hoop-earrings", shortDescription: "18k gold, lightweight everyday hoops.", description: "The Chiku Gold Hoop Earrings are crafted in lightweight 18k gold, perfect for effortless everyday elegance.", categorySlug: "earrings", material: "18k Gold", color: "Yellow Gold", priceKes: 21000, stockQuantity: 22, isNewArrival: true, collection: "Women" },
  { id: "p10", sku: "KJ-WT-001", name: "Askari Chronograph Watch", slug: "askari-chronograph-watch", shortDescription: "Stainless steel, water resistant.", description: "The Askari Chronograph Watch pairs precision engineering with a rugged stainless steel case, built for the modern Kenyan professional.", categorySlug: "watches", material: "Stainless Steel", color: "Silver", priceKes: 42000, stockQuantity: 14, isFeatured: true, collection: "Men" },
  { id: "p11", sku: "KJ-WT-002", name: "Tumaini Rose Gold Watch", slug: "tumaini-rose-gold-watch", shortDescription: "Rose gold case, sapphire crystal glass.", description: "The Tumaini Rose Gold Watch combines an elegant rose gold case with a scratch-resistant sapphire crystal glass face.", categorySlug: "watches", material: "Stainless Steel", color: "Rose Gold", priceKes: 38500, stockQuantity: 16, isBestSeller: true, collection: "Women" },
  { id: "p12", sku: "KJ-PZ-001", name: "Jina Custom Name Necklace", slug: "jina-custom-name-necklace", shortDescription: "14k gold, personalized with any name.", description: "The Jina Custom Name Necklace is handcrafted in 14k gold and personalized with the name of your choice — a truly one-of-a-kind gift.", categorySlug: "personalized-jewelry", material: "14k Gold", color: "Yellow Gold", priceKes: 18500, stockQuantity: 40, isPersonalizable: true, isNewArrival: true, collection: "Personalized" },
  { id: "p13", sku: "KJ-PZ-002", name: "Kumbukumbu Engraved Bracelet", slug: "kumbukumbu-engraved-bracelet", shortDescription: "Sterling silver, custom engraving.", description: "The Kumbukumbu Engraved Bracelet lets you add a personal message or date, hand-engraved into fine sterling silver.", categorySlug: "personalized-jewelry", material: "Sterling Silver", color: "Silver", priceKes: 9500, stockQuantity: 35, isPersonalizable: true, collection: "Personalized" },
  { id: "p14", sku: "KJ-GF-001", name: "Harusi Bridal Gift Set", slug: "harusi-bridal-gift-set", shortDescription: "Necklace, earrings & bracelet set.", description: "The Harusi Bridal Gift Set includes a matching necklace, earring, and bracelet trio in 18k gold with cubic zirconia — perfect for the big day.", categorySlug: "gift-sets", material: "18k Gold", gemstone: "Cubic Zirconia", color: "Yellow Gold", priceKes: 32000, stockQuantity: 10, isLimitedEdition: true, collection: "Gifting" },
  { id: "p15", sku: "KJ-MC-001", name: "Mfalme Signet Ring", slug: "mfalme-signet-ring", shortDescription: "18k gold, engravable signet face.", description: "The Mfalme Signet Ring is a bold 18k gold statement piece with an engravable face — a modern heirloom.", categorySlug: "mens-collection", material: "18k Gold", color: "Yellow Gold", ringSize: "R", priceKes: 47500, stockQuantity: 12, isBestSeller: true, collection: "Men" },
  { id: "p16", sku: "KJ-WC-001", name: "Malkia Statement Cocktail Ring", slug: "malkia-statement-cocktail-ring", shortDescription: "Rose gold, genuine ruby centerpiece.", description: "The Malkia Statement Cocktail Ring features a genuine ruby set in warm rose gold — bold, regal, unforgettable.", categorySlug: "womens-collection", material: "Rose Gold", gemstone: "Ruby", ringSize: "L", priceKes: 68000, stockQuantity: 7, isLimitedEdition: true, isFeatured: true, collection: "Women" },
];

export const products: Product[] = raw.map((p) => ({
  ...p,
  categoryName: categoryName(p.categorySlug),
  isAvailable: p.stockQuantity > 0,
  avgRating: 4.3 + (Number(p.id.replace("p", "")) % 6) * 0.1,
  reviewCount: 12 + (Number(p.id.replace("p", "")) % 9) * 7,
  warrantyMonths: 12,
  images: [1, 2, 3].map((n) => ({ url: img(`${p.name} ${n}`), altText: p.name, is360: n === 3 })),
}));

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return products.filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id).slice(0, limit);
}

export const bestSellers = products.filter((p) => p.isBestSeller);
export const newArrivals = products.filter((p) => p.isNewArrival);
export const limitedEdition = products.filter((p) => p.isLimitedEdition);
export const featuredProducts = products.filter((p) => p.isFeatured);
