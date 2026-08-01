"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Heart, Minus, MessageCircle, Plus, Share2, ShoppingBag } from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { buildWhatsAppLink } from "@/lib/constants";
import { formatKes } from "@/lib/format";
import { cn } from "@/lib/cn";

export function ProductActions({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const router = useRouter();
  const wishlisted = isWishlisted(product.id);

  const quoteLink = buildWhatsAppLink(
    `Hi! I'd like a quotation for the ${product.name} (SKU: ${product.sku}, ${formatKes(product.priceKes)}). Could you share more details?`
  );
  const consultLink = buildWhatsAppLink(`Hi! I'd like to book a consultation about the ${product.name} (SKU: ${product.sku}).`);

  async function handleShare() {
    const shareData = { title: product.name, text: product.shortDescription, url: window.location.href };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-full border border-ink-900/15 dark:border-white/15">
          <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="flex h-11 w-11 items-center justify-center" aria-label="Decrease quantity">
            <Minus size={15} />
          </button>
          <span className="w-8 text-center text-sm font-medium">{quantity}</span>
          <button onClick={() => setQuantity((q) => q + 1)} className="flex h-11 w-11 items-center justify-center" aria-label="Increase quantity">
            <Plus size={15} />
          </button>
        </div>
        <span className="text-xs text-ink-700/60 dark:text-beige-100/60">
          {product.isAvailable ? `${product.stockQuantity} in stock` : "Out of stock"}
        </span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => addItem(product.id, quantity)}
          disabled={!product.isAvailable}
          className="btn-secondary flex-1 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShoppingBag size={16} /> Add to Cart
        </button>
        <button
          onClick={() => {
            addItem(product.id, quantity);
            router.push("/checkout");
          }}
          disabled={!product.isAvailable}
          className="btn-gold flex-1 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Buy Now
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm">
        <button onClick={() => toggle(product.id)} className="flex items-center gap-1.5 text-ink-700 hover:text-gold-600 dark:text-beige-100/80">
          <Heart size={16} className={cn(wishlisted && "fill-gold-500 text-gold-500")} /> {wishlisted ? "Saved" : "Save"}
        </button>
        <button onClick={handleShare} className="flex items-center gap-1.5 text-ink-700 hover:text-gold-600 dark:text-beige-100/80">
          <Share2 size={16} /> Share
        </button>
        <a href={quoteLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-ink-700 hover:text-gold-600 dark:text-beige-100/80">
          <MessageCircle size={16} /> Request Quote
        </a>
        <a href={consultLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-ink-700 hover:text-gold-600 dark:text-beige-100/80">
          <Calendar size={16} /> Book Consultation
        </a>
      </div>
    </div>
  );
}
