"use client";

import { useState } from "react";
import { BadgeCheck } from "lucide-react";
import { Product } from "@/types";
import { StarRating } from "@/components/ui/StarRating";
import { formatDate } from "@/lib/format";
import { getReviewsForProduct } from "@/data/reviews";
import { cn } from "@/lib/cn";

const TABS = ["Description", "Specifications", "Size Guide", "Reviews"] as const;

export function ProductTabs({ product }: { product: Product }) {
  const [active, setActive] = useState<(typeof TABS)[number]>("Description");
  const reviews = getReviewsForProduct(product.id);

  return (
    <div className="mt-16">
      <div className="flex gap-6 overflow-x-auto border-b border-ink-900/10 dark:border-white/10">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={cn(
              "whitespace-nowrap border-b-2 pb-3 text-sm font-medium transition-colors",
              active === tab ? "border-gold-500 text-gold-600" : "border-transparent text-ink-700/60 hover:text-ink-900 dark:text-beige-100/60"
            )}
          >
            {tab === "Reviews" ? `Reviews (${reviews.length})` : tab}
          </button>
        ))}
      </div>

      <div className="py-8">
        {active === "Description" && (
          <div className="max-w-3xl space-y-4 text-sm leading-relaxed text-ink-700/85 dark:text-beige-100/80">
            <p>{product.description}</p>
            {product.certification && (
              <p className="flex items-center gap-2 font-medium text-ink-900 dark:text-white">
                <BadgeCheck size={16} className="text-gold-500" /> {product.certification}
              </p>
            )}
          </div>
        )}

        {active === "Specifications" && (
          <dl className="grid max-w-2xl grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            {[
              ["SKU", product.sku],
              ["Material", product.material],
              ["Gemstone", product.gemstone ?? "N/A"],
              ["Color", product.color ?? "N/A"],
              ["Ring Size", product.ringSize ?? "N/A"],
              ["Collection", product.collection ?? "N/A"],
              ["Warranty", `${product.warrantyMonths} months`],
              ["Availability", product.isAvailable ? "In Stock" : "Out of Stock"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between border-b border-ink-900/10 pb-2 text-sm dark:border-white/10">
                <dt className="text-ink-700/60 dark:text-beige-100/60">{label}</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        )}

        {active === "Size Guide" && (
          <div className="max-w-2xl overflow-x-auto">
            <p className="mb-4 text-sm text-ink-700/80 dark:text-beige-100/70">
              Not sure of your ring size? Wrap a strip of paper around your finger, mark where it overlaps, measure the length in
              millimeters, and match it below. For an exact fit, visit any showroom for a free professional sizing.
            </p>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink-900/10 dark:border-white/10">
                  <th className="py-2">Kenyan Size</th>
                  <th className="py-2">US Size</th>
                  <th className="py-2">Circumference (mm)</th>
                </tr>
              </thead>
              <tbody className="text-ink-700/80 dark:text-beige-100/70">
                {[
                  ["J", "5", "49.3"],
                  ["L", "6", "51.9"],
                  ["N", "7", "54.4"],
                  ["P", "8", "57.0"],
                  ["R", "9", "59.5"],
                ].map((row) => (
                  <tr key={row[0]} className="border-b border-ink-900/5 dark:border-white/5">
                    {row.map((cell) => (
                      <td key={cell} className="py-2">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {active === "Reviews" && (
          <div className="max-w-2xl space-y-6">
            <div className="flex items-center gap-4">
              <p className="font-display text-4xl font-semibold">{product.avgRating.toFixed(1)}</p>
              <div>
                <StarRating rating={product.avgRating} size={16} />
                <p className="mt-1 text-xs text-ink-700/60 dark:text-beige-100/60">Based on {product.reviewCount} reviews</p>
              </div>
            </div>
            <div className="space-y-5">
              {reviews.map((r) => (
                <div key={r.id} className="border-b border-ink-900/10 pb-5 dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{r.userName}</p>
                    <p className="text-xs text-ink-700/50 dark:text-beige-100/40">{formatDate(r.createdAt)}</p>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <StarRating rating={r.rating} />
                    {r.isVerifiedPurchase && (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-gold-600">
                        <BadgeCheck size={12} /> Verified Purchase
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-ink-700/80 dark:text-beige-100/75">{r.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
