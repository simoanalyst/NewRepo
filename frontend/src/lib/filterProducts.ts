import { Product } from "@/types";
import { products as allProducts } from "@/data/products";

export interface ProductFilterState {
  search?: string;
  category?: string;
  collection?: string;
  material?: string[];
  gemstone?: string[];
  color?: string[];
  ringSize?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  filter?: "new" | "bestsellers" | "limited" | "featured";
  sort?: "newest" | "price_asc" | "price_desc" | "rating";
}

export function filterProducts(state: ProductFilterState): Product[] {
  let list = [...allProducts];

  if (state.category) list = list.filter((p) => p.categorySlug === state.category);
  if (state.collection) list = list.filter((p) => p.collection === state.collection);
  if (state.search) {
    const q = state.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q) ||
        p.gemstone?.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q)
    );
  }
  if (state.material?.length) list = list.filter((p) => state.material!.includes(p.material));
  if (state.gemstone?.length) list = list.filter((p) => p.gemstone && state.gemstone!.includes(p.gemstone));
  if (state.color?.length) list = list.filter((p) => p.color && state.color!.includes(p.color));
  if (state.ringSize?.length) list = list.filter((p) => p.ringSize && state.ringSize!.includes(p.ringSize));
  if (state.minPrice) list = list.filter((p) => p.priceKes >= state.minPrice!);
  if (state.maxPrice) list = list.filter((p) => p.priceKes <= state.maxPrice!);
  if (state.inStockOnly) list = list.filter((p) => p.isAvailable);

  if (state.filter === "new") list = list.filter((p) => p.isNewArrival);
  if (state.filter === "bestsellers") list = list.filter((p) => p.isBestSeller);
  if (state.filter === "limited") list = list.filter((p) => p.isLimitedEdition);
  if (state.filter === "featured") list = list.filter((p) => p.isFeatured);

  switch (state.sort) {
    case "price_asc":
      list.sort((a, b) => a.priceKes - b.priceKes);
      break;
    case "price_desc":
      list.sort((a, b) => b.priceKes - a.priceKes);
      break;
    case "rating":
      list.sort((a, b) => b.avgRating - a.avgRating);
      break;
    default:
      break;
  }

  return list;
}

export function getFilterOptions() {
  const materials = Array.from(new Set(allProducts.map((p) => p.material)));
  const gemstones = Array.from(new Set(allProducts.map((p) => p.gemstone).filter(Boolean))) as string[];
  const colors = Array.from(new Set(allProducts.map((p) => p.color).filter(Boolean))) as string[];
  const ringSizes = Array.from(new Set(allProducts.map((p) => p.ringSize).filter(Boolean))) as string[];
  const prices = allProducts.map((p) => p.priceKes);
  return { materials, gemstones, colors, ringSizes, minPrice: Math.min(...prices), maxPrice: Math.max(...prices) };
}
