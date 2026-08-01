import { Request, Response } from "express";
import { prisma } from "@/config/db";
import { AppError } from "@/utils/AppError";
import { created, ok } from "@/utils/apiResponse";
import { z } from "zod";
import { AuthenticatedRequest } from "@/middleware/auth";

const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  parentId: z.string().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function listCategories(_req: Request, res: Response) {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return ok(res, categories);
}

export async function getCategoryBySlug(req: Request, res: Response) {
  const category = await prisma.category.findUnique({ where: { slug: req.params.slug } });
  if (!category) throw new AppError(404, "Category not found");
  return ok(res, category);
}

export async function createCategory(req: AuthenticatedRequest, res: Response) {
  const input = categorySchema.parse(req.body);
  const category = await prisma.category.create({ data: input });
  return created(res, category);
}

export async function updateCategory(req: AuthenticatedRequest, res: Response) {
  const input = categorySchema.partial().parse(req.body);
  const category = await prisma.category.update({ where: { id: req.params.id }, data: input });
  return ok(res, category);
}

export async function deleteCategory(req: AuthenticatedRequest, res: Response) {
  await prisma.category.delete({ where: { id: req.params.id } });
  return ok(res, { deleted: true });
}
