"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatKes } from "@/lib/format";
import { FREE_DELIVERY_THRESHOLD_KES } from "@/lib/constants";

export default function CartPage() {
  const { items, subtotalKes, updateQuantity, removeItem } = useCart();
  const [coupon, setCoupon] = useState("");
  const remainingForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD_KES - subtotalKes);

  if (items.length === 0) {
    return (
      <div className="container-luxe py-24 text-center">
        <h1 className="section-heading">Your Cart is Empty</h1>
        <p className="section-subheading mx-auto">Browse our collections and find something you'll treasure.</p>
        <Link href="/shop" className="btn-gold mt-6 inline-flex">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-luxe py-10">
      <h1 className="section-heading">Shopping Cart</h1>

      {remainingForFreeDelivery > 0 ? (
        <p className="mt-3 rounded-full bg-beige-100 px-4 py-2 text-sm text-ink-800 dark:bg-ink-800 dark:text-beige-100">
          Add {formatKes(remainingForFreeDelivery)} more to unlock <strong>free delivery</strong>.
        </p>
      ) : (
        <p className="mt-3 flex items-center gap-2 rounded-full bg-gold-50 px-4 py-2 text-sm text-gold-700 dark:bg-gold-900/20 dark:text-gold-300">
          <ShieldCheck size={16} /> You've unlocked free delivery!
        </p>
      )}

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="card-luxe flex gap-4 p-4">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-beige-100 sm:h-28 sm:w-28">
                <Image src={product.images[0]?.url} alt={product.name} fill className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between gap-2">
                  <div>
                    <Link href={`/product/${product.slug}`} className="font-display text-base font-medium hover:text-gold-600 sm:text-lg">
                      {product.name}
                    </Link>
                    <p className="text-xs text-ink-700/60 dark:text-beige-100/60">
                      {product.material}
                      {product.color ? ` · ${product.color}` : ""}
                    </p>
                  </div>
                  <button onClick={() => removeItem(product.id)} aria-label="Remove item" className="text-ink-500 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded-full border border-ink-900/15 dark:border-white/15">
                    <button onClick={() => updateQuantity(product.id, quantity - 1)} className="flex h-9 w-9 items-center justify-center">
                      <Minus size={13} />
                    </button>
                    <span className="w-6 text-center text-sm">{quantity}</span>
                    <button onClick={() => updateQuantity(product.id, quantity + 1)} className="flex h-9 w-9 items-center justify-center">
                      <Plus size={13} />
                    </button>
                  </div>
                  <p className="font-semibold">{formatKes(product.priceKes * quantity)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card-luxe h-fit p-6">
          <p className="font-display text-xl font-semibold">Order Summary</p>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-700/70 dark:text-beige-100/60">Subtotal</span>
              <span>{formatKes(subtotalKes)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-700/70 dark:text-beige-100/60">Delivery</span>
              <span>Calculated at checkout</span>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="Coupon code"
              className="w-full rounded-full border border-ink-900/15 bg-transparent px-4 py-2 text-sm dark:border-white/15"
            />
            <button className="btn-secondary !px-4 !py-2 text-xs">Apply</button>
          </div>

          <div className="mt-4 flex justify-between border-t border-ink-900/10 pt-4 text-base font-semibold dark:border-white/10">
            <span>Total</span>
            <span>{formatKes(subtotalKes)}</span>
          </div>

          <Link href="/checkout" className="btn-gold mt-5 w-full">
            Proceed to Checkout
          </Link>
          <p className="mt-3 text-center text-xs text-ink-700/50 dark:text-beige-100/40">Secure checkout · M-Pesa, Airtel Money, Card</p>
        </div>
      </div>
    </div>
  );
}
