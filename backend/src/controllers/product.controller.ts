import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "@/config/db";
import { AppError } from "@/utils/AppError";
import { created, ok } from "@/utils/apiResponse";
import { productCreateSchema, productQuerySchema, productUpdateSchema } from "@/validators/product.validators";
import { recordAudit } from "@/middleware/audit";
import { AuthenticatedRequest } from "@/middleware/auth";

const SORT_MAP: Record<string, Prisma.ProductOrderByWithRelationInput> = {
  newest: { createdAt: "desc" },
  price_asc: { priceKes: "asc" },
  price_desc: { priceKes: "desc" },
  rating: { avgRating: "desc" },
  popularity: { reviewCount: "desc" },
};

export async function listProducts(req: Request, res: Response) {
  const q = productQuerySchema.parse(req.query);

  const where: Prisma.ProductWhereInput = {
    isAvailable: q.inStockOnly ? true : undefined,
    stockQuantity: q.inStockOnly ? { gt: 0 } : undefined,
    category: q.category ? { slug: q.category } : undefined,
    collection: q.collection ?? undefined,
    material: q.material ?? undefined,
    gemstone: q.gemstone ?? undefined,
    color: q.color ?? undefined,
    ringSize: q.ringSize ?? undefined,
    isFeatured: q.isFeatured,
    isBestSeller: q.isBestSeller,
    isNewArrival: q.isNewArrival,
    isLimitedEdition: q.isLimitedEdition,
    priceKes:
      q.minPrice || q.maxPrice
        ? { gte: q.minPrice ?? undefined, lte: q.maxPrice ?? undefined }
        : undefined,
    OR: q.search
      ? [
          { name: { contains: q.search, mode: "insensitive" } },
          { description: { contains: q.search, mode: "insensitive" } },
          { gemstone: { contains: q.search, mode: "insensitive" } },
          { material: { contains: q.search, mode: "insensitive" } },
          { sku: { contains: q.search, mode: "insensitive" } },
        ]
      : undefined,
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: SORT_MAP[q.sort ?? "newest"],
      skip: (q.page - 1) * q.pageSize,
      take: q.pageSize,
      include: { images: { orderBy: { sortOrder: "asc" } }, category: true },
    }),
    prisma.product.count({ where }),
  ]);

  return ok(res, items, { page: q.page, pageSize: q.pageSize, total, totalPages: Math.ceil(total / q.pageSize) });
}

export async function getProductBySlug(req: Request, res: Response) {
  const product = await prisma.product.findUnique({
    where: { slug: req.params.slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      videos: true,
      variants: true,
      category: true,
      reviews: { where: { isApproved: true }, include: { user: { select: { firstName: true, lastName: true } } }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!product) throw new AppError(404, "Product not found");

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id } },
    take: 8,
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });

  return ok(res, { product, related });
}

export async function createProduct(req: AuthenticatedRequest, res: Response) {
  const input = productCreateSchema.parse(req.body);
  const { images, ...productData } = input;

  const product = await prisma.product.create({
    data: {
      ...productData,
      images: images ? { create: images.map((img, idx) => ({ ...img, sortOrder: idx })) } : undefined,
    },
    include: { images: true },
  });

  await recordAudit({ userId: req.user?.userId, action: "CREATE", entity: "Product", entityId: product.id });
  return created(res, product);
}

export async function updateProduct(req: AuthenticatedRequest, res: Response) {
  const input = productUpdateSchema.parse(req.body);
  const { images, ...productData } = input;

  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: productData,
  });

  await recordAudit({ userId: req.user?.userId, action: "UPDATE", entity: "Product", entityId: product.id });
  return ok(res, product);
}

export async function deleteProduct(req: AuthenticatedRequest, res: Response) {
  await prisma.product.delete({ where: { id: req.params.id } });
  await recordAudit({ userId: req.user?.userId, action: "DELETE", entity: "Product", entityId: req.params.id });
  return ok(res, { deleted: true });
}

export async function getFilterOptions(_req: Request, res: Response) {
  const [materials, gemstones, colors, ringSizes, priceRange] = await Promise.all([
    prisma.product.findMany({ distinct: ["material"], select: { material: true } }),
    prisma.product.findMany({ distinct: ["gemstone"], select: { gemstone: true }, where: { gemstone: { not: null } } }),
    prisma.product.findMany({ distinct: ["color"], select: { color: true }, where: { color: { not: null } } }),
    prisma.product.findMany({ distinct: ["ringSize"], select: { ringSize: true }, where: { ringSize: { not: null } } }),
    prisma.product.aggregate({ _min: { priceKes: true }, _max: { priceKes: true } }),
  ]);

  return ok(res, {
    materials: materials.map((m) => m.material),
    gemstones: gemstones.map((g) => g.gemstone),
    colors: colors.map((c) => c.color),
    ringSizes: ringSizes.map((r) => r.ringSize),
    priceRange: { min: priceRange._min.priceKes ?? 0, max: priceRange._max.priceKes ?? 0 },
  });
}
