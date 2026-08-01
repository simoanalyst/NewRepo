import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const placeholder = (seed: string, w = 900, h = 900) =>
  `https://placehold.co/${w}x${h}/f5efe6/1a1a1a?text=${encodeURIComponent(seed)}`;

async function main() {
  console.log("Seeding database...");

  // --- Admin user ---
  const adminPasswordHash = await bcrypt.hash("Admin@12345", 12);
  await prisma.user.upsert({
    where: { phone: "+254700000001" },
    update: {},
    create: {
      firstName: "Amina",
      lastName: "Wanjiru",
      phone: "+254700000001",
      email: "admin@kenyanjewelry.co.ke",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      phoneVerified: true,
    },
  });

  const customerPasswordHash = await bcrypt.hash("Customer@123", 12);
  await prisma.user.upsert({
    where: { phone: "+254711000002" },
    update: {},
    create: {
      firstName: "Brian",
      lastName: "Otieno",
      phone: "+254711000002",
      email: "brian.customer@example.com",
      passwordHash: customerPasswordHash,
      role: "CUSTOMER",
      phoneVerified: true,
    },
  });

  // --- Categories ---
  const categoryDefs = [
    { name: "Engagement Rings", slug: "engagement-rings", isFeatured: true },
    { name: "Wedding Bands", slug: "wedding-bands", isFeatured: true },
    { name: "Necklaces", slug: "necklaces", isFeatured: true },
    { name: "Bracelets", slug: "bracelets", isFeatured: true },
    { name: "Earrings", slug: "earrings", isFeatured: true },
    { name: "Watches", slug: "watches", isFeatured: true },
    { name: "Men's Collection", slug: "mens-collection", isFeatured: false },
    { name: "Women's Collection", slug: "womens-collection", isFeatured: false },
    { name: "Personalized Jewelry", slug: "personalized-jewelry", isFeatured: true },
    { name: "Gift Sets", slug: "gift-sets", isFeatured: false },
  ];

  const categories: Record<string, string> = {};
  for (const [i, def] of categoryDefs.entries()) {
    const category = await prisma.category.upsert({
      where: { slug: def.slug },
      update: {},
      create: {
        name: def.name,
        slug: def.slug,
        description: `Explore our exquisite ${def.name.toLowerCase()} collection, handcrafted for the discerning Kenyan customer.`,
        imageUrl: placeholder(def.name, 600, 400),
        isFeatured: def.isFeatured,
        sortOrder: i,
        metaTitle: `${def.name} | Kenyan Jewelry`,
        metaDescription: `Shop premium ${def.name.toLowerCase()} in Kenya. Certified materials, nationwide delivery, M-Pesa payments accepted.`,
      },
    });
    categories[def.slug] = category.id;
  }

  // --- Stores ---
  await prisma.store.upsert({
    where: { id: "store-nairobi-flagship" },
    update: {},
    create: {
      id: "store-nairobi-flagship",
      name: "Kenyan Jewelry — Westlands Flagship",
      county: "Nairobi",
      address: "The Address, 5th Floor, Muthithi Road, Westlands, Nairobi",
      phone: "+254700000001",
      lat: -1.2673,
      lng: 36.8076,
      openingHours: { mon: "9:00-19:00", tue: "9:00-19:00", wed: "9:00-19:00", thu: "9:00-19:00", fri: "9:00-19:00", sat: "10:00-18:00", sun: "Closed" },
      isFlagship: true,
    },
  });
  await prisma.store.upsert({
    where: { id: "store-mombasa" },
    update: {},
    create: {
      id: "store-mombasa",
      name: "Kenyan Jewelry — Nyali, Mombasa",
      county: "Mombasa",
      address: "City Mall, Links Road, Nyali, Mombasa",
      phone: "+254700000003",
      lat: -4.0269,
      lng: 39.7115,
      openingHours: { mon: "9:00-19:00", tue: "9:00-19:00", wed: "9:00-19:00", thu: "9:00-19:00", fri: "9:00-19:00", sat: "10:00-18:00", sun: "11:00-16:00" },
      isFlagship: false,
    },
  });

  // --- Products ---
  const products = [
    {
      sku: "KJ-ER-001", name: "Amara Solitaire Engagement Ring", slug: "amara-solitaire-engagement-ring",
      category: "engagement-rings", material: "18k Gold", gemstone: "Diamond", color: "Yellow Gold", ringSize: "M",
      priceKes: 185000, compareAtPriceKes: 220000, collection: "Engagement", isFeatured: true, isBestSeller: true,
      certification: "GIA Certified 0.5ct Diamond",
    },
    {
      sku: "KJ-ER-002", name: "Zawadi Halo Engagement Ring", slug: "zawadi-halo-engagement-ring",
      category: "engagement-rings", material: "Platinum", gemstone: "Diamond", color: "Platinum", ringSize: "N",
      priceKes: 245000, collection: "Engagement", isFeatured: true, isLimitedEdition: true,
      certification: "GIA Certified 0.75ct Diamond",
    },
    {
      sku: "KJ-WB-001", name: "Nia Classic Wedding Band (Pair)", slug: "nia-classic-wedding-band-pair",
      category: "wedding-bands", material: "18k Gold", color: "Rose Gold", priceKes: 98000, collection: "Wedding",
      isBestSeller: true,
    },
    {
      sku: "KJ-NK-001", name: "Malaika Layered Necklace", slug: "malaika-layered-necklace",
      category: "necklaces", material: "Sterling Silver", gemstone: "Cubic Zirconia", color: "Silver", priceKes: 12500,
      collection: "Women", isNewArrival: true,
    },
    {
      sku: "KJ-NK-002", name: "Adhiambo Gold Pendant Necklace", slug: "adhiambo-gold-pendant-necklace",
      category: "necklaces", material: "18k Gold", gemstone: "Emerald", color: "Yellow Gold", priceKes: 76000,
      collection: "Women", isFeatured: true,
    },
    {
      sku: "KJ-BR-001", name: "Furaha Tennis Bracelet", slug: "furaha-tennis-bracelet",
      category: "bracelets", material: "White Gold", gemstone: "Diamond", color: "White Gold", priceKes: 165000,
      collection: "Women", isBestSeller: true,
    },
    {
      sku: "KJ-BR-002", name: "Simba Men's Chain Bracelet", slug: "simba-mens-chain-bracelet",
      category: "bracelets", material: "Titanium", color: "Black", priceKes: 15500, collection: "Men",
      isNewArrival: true,
    },
    {
      sku: "KJ-EA-001", name: "Neema Diamond Stud Earrings", slug: "neema-diamond-stud-earrings",
      category: "earrings", material: "18k Gold", gemstone: "Diamond", color: "Yellow Gold", priceKes: 54000,
      collection: "Women", isBestSeller: true,
    },
    {
      sku: "KJ-EA-002", name: "Chiku Gold Hoop Earrings", slug: "chiku-gold-hoop-earrings",
      category: "earrings", material: "18k Gold", color: "Yellow Gold", priceKes: 21000, collection: "Women",
      isNewArrival: true,
    },
    {
      sku: "KJ-WT-001", name: "Askari Chronograph Watch", slug: "askari-chronograph-watch",
      category: "watches", material: "Stainless Steel", color: "Silver", priceKes: 42000, collection: "Men",
      isFeatured: true,
    },
    {
      sku: "KJ-WT-002", name: "Tumaini Rose Gold Watch", slug: "tumaini-rose-gold-watch",
      category: "watches", material: "Stainless Steel", color: "Rose Gold", priceKes: 38500, collection: "Women",
      isBestSeller: true,
    },
    {
      sku: "KJ-PZ-001", name: "Jina Custom Name Necklace", slug: "jina-custom-name-necklace",
      category: "personalized-jewelry", material: "14k Gold", color: "Yellow Gold", priceKes: 18500,
      collection: "Personalized", isPersonalizable: true, isNewArrival: true,
    },
    {
      sku: "KJ-PZ-002", name: "Kumbukumbu Engraved Bracelet", slug: "kumbukumbu-engraved-bracelet",
      category: "personalized-jewelry", material: "Sterling Silver", color: "Silver", priceKes: 9500,
      collection: "Personalized", isPersonalizable: true,
    },
    {
      sku: "KJ-GF-001", name: "Harusi Bridal Gift Set", slug: "harusi-bridal-gift-set",
      category: "gift-sets", material: "18k Gold", gemstone: "Cubic Zirconia", color: "Yellow Gold", priceKes: 32000,
      collection: "Gifting", isLimitedEdition: true,
    },
    {
      sku: "KJ-MC-001", name: "Mfalme Signet Ring", slug: "mfalme-signet-ring",
      category: "mens-collection", material: "18k Gold", color: "Yellow Gold", ringSize: "R", priceKes: 47500,
      collection: "Men", isBestSeller: true,
    },
    {
      sku: "KJ-WC-001", name: "Malkia Statement Cocktail Ring", slug: "malkia-statement-cocktail-ring",
      category: "womens-collection", material: "Rose Gold", gemstone: "Ruby", ringSize: "L", priceKes: 68000,
      collection: "Women", isLimitedEdition: true, isFeatured: true,
    },
  ];

  for (const p of products) {
    const { category, ...rest } = p;
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        ...rest,
        categoryId: categories[category],
        description: `The ${p.name} is meticulously handcrafted using ${p.material}${p.gemstone ? ` and set with genuine ${p.gemstone}` : ""}. Designed in Nairobi, this piece captures timeless elegance for the modern Kenyan wearer. Each item comes with an authenticity guarantee and a 12-month warranty against manufacturing defects.`,
        shortDescription: `Handcrafted ${p.material} piece${p.gemstone ? ` featuring ${p.gemstone}` : ""}.`,
        stockQuantity: 15,
        warrantyMonths: 12,
        metaTitle: `${p.name} | Buy Online in Kenya | KES ${p.priceKes.toLocaleString()}`,
        metaDescription: `Shop the ${p.name} — ${p.material}${p.gemstone ? `, ${p.gemstone}` : ""}. Pay via M-Pesa. Nationwide delivery across Kenya.`,
      },
    });

    await prisma.productImage.createMany({
      data: [1, 2, 3].map((n) => ({
        productId: product.id,
        url: placeholder(`${p.name} ${n}`),
        altText: p.name,
        sortOrder: n,
        is360: n === 3,
      })),
      skipDuplicates: true,
    });
  }

  // --- Banners ---
  await prisma.banner.createMany({
    data: [
      {
        title: "Timeless Elegance, Handcrafted in Kenya",
        subtitle: "Discover our new Wedding & Engagement collection",
        imageUrl: placeholder("Hero Banner", 1600, 800),
        ctaLabel: "Shop the Collection",
        ctaUrl: "/shop/engagement-rings",
        placement: "HERO",
        sortOrder: 1,
      },
      {
        title: "Free Delivery on Orders Above KES 15,000",
        subtitle: "Pay securely with M-Pesa, Airtel Money, or Card",
        imageUrl: placeholder("Promo Strip", 1600, 400),
        ctaLabel: "Start Shopping",
        ctaUrl: "/shop",
        placement: "PROMO_STRIP",
        sortOrder: 1,
      },
    ],
    skipDuplicates: true,
  });

  // --- Coupons ---
  await prisma.coupon.upsert({
    where: { code: "KARIBU10" },
    update: {},
    create: {
      code: "KARIBU10",
      description: "10% off your first order",
      percentOff: 10,
      minOrderKes: 5000,
      isActive: true,
    },
  });

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
