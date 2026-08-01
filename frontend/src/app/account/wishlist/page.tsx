"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { ProductCard } from "@/components/product/ProductCard";

export default function WishlistPage() {
  const { items } = useWishlist();

  return (
    <div className="container-luxe py-10">
      <h1 className="section-heading">My Wishlist</h1>
      <p className="section-subheading">Pieces you've saved for later.</p>

      {items.length === 0 ? (
        <div className="mt-10 flex flex-col items-center py-14 text-center">
          <Heart size={40} className="text-gold-500" />
          <p className="mt-3 text-ink-700/70 dark:text-beige-100/60">Your wishlist is empty.</p>
          <Link href="/shop" className="btn-gold mt-5">
            Discover Jewelry
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
