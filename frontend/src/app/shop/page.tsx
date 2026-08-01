import { Suspense } from "react";
import type { Metadata } from "next";
import { ShopExplorer } from "@/components/product/ShopExplorer";

export const metadata: Metadata = {
  title: "Shop All Jewelry",
  description: "Browse our full catalog of certified rings, necklaces, bracelets, earrings, and watches. Filter by material, gemstone, and price in KES.",
};

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="container-luxe py-20 text-center text-sm text-ink-500">Loading catalog…</div>}>
      <ShopExplorer />
    </Suspense>
  );
}
