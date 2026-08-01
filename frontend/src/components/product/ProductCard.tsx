"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { Product } from "@/types";
import { formatKes, percentOff } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { StarRating } from "@/components/ui/StarRating";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { cn } from "@/lib/cn";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const discount = percentOff(product.priceKes, product.compareAtPriceKes);
  const wishlisted = isWishlisted(product.id);

  return (
    <div className="card-luxe group relative flex flex-col overflow-hidden">
      <div className="relative aspect-square overflow-hidden bg-beige-100 dark:bg-ink-700">
        <Link href={`/product/${product.slug}`}>
          <Image
            src={product.images[0]?.url}
            alt={product.images[0]?.altText ?? product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        </Link>

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.isNewArrival && <Badge variant="dark">New</Badge>}
          {product.isBestSeller && <Badge variant="gold">Best Seller</Badge>}
          {product.isLimitedEdition && <Badge variant="danger">Limited</Badge>}
          {discount && <Badge variant="outline" className="bg-white dark:bg-ink-900">-{discount}%</Badge>}
        </div>

        <button
          onClick={() => toggle(product.id)}
          aria-label="Toggle wishlist"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink-900 shadow transition-transform hover:scale-110 dark:bg-ink-900/80 dark:text-white"
        >
          <Heart size={16} className={cn(wishlisted && "fill-gold-500 text-gold-500")} />
        </button>

        <button
          onClick={() => addItem(product.id, 1)}
          className="absolute inset-x-3 bottom-3 flex translate-y-14 items-center justify-center gap-2 rounded-full bg-ink-900/90 py-2.5 text-xs font-semibold uppercase tracking-wide text-white opacity-0 backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 dark:bg-white/90 dark:text-ink-900"
        >
          <ShoppingBag size={14} /> Add to Cart
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-[11px] uppercase tracking-wider text-ink-500 dark:text-beige-100/50">{product.categoryName}</p>
        <Link href={`/product/${product.slug}`} className="font-display text-lg font-medium leading-snug text-ink-900 hover:text-gold-600 dark:text-white">
          {product.name}
        </Link>
        <StarRating rating={product.avgRating} showValue />
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-base font-semibold text-ink-900 dark:text-white">{formatKes(product.priceKes)}</span>
          {product.compareAtPriceKes && (
            <span className="text-sm text-ink-500/60 line-through dark:text-beige-100/40">{formatKes(product.compareAtPriceKes)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
