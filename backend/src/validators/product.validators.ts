import { z } from "zod";

export const productQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  collection: z.string().optional(),
  material: z.string().optional(),
  gemstone: z.string().optional(),
  color: z.string().optional(),
  ringSize: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  inStockOnly: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  isBestSeller: z.coerce.boolean().optional(),
  isNewArrival: z.coerce.boolean().optional(),
  isLimitedEdition: z.coerce.boolean().optional(),
  sort: z.enum(["newest", "price_asc", "price_desc", "rating", "popularity"]).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(60).optional().default(20),
});

export const productCreateSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  shortDescription: z.string().optional(),
  description: z.string().min(1),
  categoryId: z.string().min(1),
  material: z.string().min(1),
  gemstone: z.string().optional(),
  color: z.string().optional(),
  ringSize: z.string().optional(),
  priceKes: z.number().int().positive(),
  compareAtPriceKes: z.number().int().positive().optional(),
  weightGrams: z.number().positive().optional(),
  stockQuantity: z.number().int().nonnegative().default(0),
  isFeatured: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  isNewArrival: z.boolean().optional(),
  isLimitedEdition: z.boolean().optional(),
  isPersonalizable: z.boolean().optional(),
  collection: z.string().optional(),
  certification: z.string().optional(),
  warrantyMonths: z.number().int().nonnegative().optional(),
  images: z.array(z.object({ url: z.string().url(), altText: z.string().optional(), is360: z.boolean().optional() })).optional(),
});

export const productUpdateSchema = productCreateSchema.partial();
