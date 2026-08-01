import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopExplorer } from "@/components/product/ShopExplorer";
import { categories } from "@/data/categories";

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export function generateMetadata({ params }: { params: { category: string } }): Metadata {
  const category = categories.find((c) => c.slug === params.category);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description,
  };
}

export default function CategoryShopPage({ params }: { params: { category: string } }) {
  const category = categories.find((c) => c.slug === params.category);
  if (!category) notFound();

  return (
    <Suspense fallback={<div className="container-luxe py-20 text-center text-sm text-ink-500">Loading catalog…</div>}>
      <ShopExplorer categorySlug={category.slug} categoryName={category.name} />
    </Suspense>
  );
}
