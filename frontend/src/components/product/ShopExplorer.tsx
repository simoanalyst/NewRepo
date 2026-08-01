"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductFilters } from "@/components/product/ProductFilters";
import { ProductCard } from "@/components/product/ProductCard";
import { filterProducts } from "@/lib/filterProducts";

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

export function ShopExplorer({ categorySlug, categoryName }: { categorySlug?: string; categoryName?: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [page, setPage] = useState(1);

  const products = useMemo(
    () =>
      filterProducts({
        category: categorySlug,
        search: searchParams.get("search") ?? undefined,
        collection: searchParams.get("collection") ?? undefined,
        material: searchParams.get("material")?.split(",").filter(Boolean),
        gemstone: searchParams.get("gemstone")?.split(",").filter(Boolean),
        color: searchParams.get("color")?.split(",").filter(Boolean),
        ringSize: searchParams.get("ringSize")?.split(",").filter(Boolean),
        minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
        maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
        inStockOnly: searchParams.get("inStockOnly") === "true",
        filter: (searchParams.get("filter") as "new" | "bestsellers" | "limited" | "featured" | null) ?? undefined,
        sort: (searchParams.get("sort") as "newest" | "price_asc" | "price_desc" | "rating" | null) ?? undefined,
      }),
    [categorySlug, searchParams]
  );

  const paginated = products.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < products.length;

  const setSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="container-luxe py-10">
      <div className="mb-6">
        <h1 className="section-heading">{categoryName ?? "Shop All Jewelry"}</h1>
        <p className="section-subheading">{products.length} pieces available</p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <ProductFilters />

        <div className="flex-1">
          <div className="mb-5 flex items-center justify-end">
            <select
              defaultValue={searchParams.get("sort") ?? "newest"}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-full border border-ink-900/15 bg-transparent px-4 py-2 text-sm dark:border-white/15"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="text-ink-900">
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {paginated.length === 0 ? (
            <div className="rounded-xl2 border border-dashed border-ink-900/15 py-20 text-center dark:border-white/15">
              <p className="text-ink-700/70 dark:text-beige-100/70">No pieces match your filters. Try adjusting them.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
              {paginated.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {hasMore && (
            <div className="mt-10 text-center">
              <button onClick={() => setPage((p) => p + 1)} className="btn-secondary">
                Load More
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
