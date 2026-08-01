"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { categories } from "@/data/categories";
import { cn } from "@/lib/cn";

const NAV_LINKS = [
  { label: "New Arrivals", href: "/shop?filter=new" },
  { label: "Engagement", href: "/shop/engagement-rings" },
  { label: "Women", href: "/shop?collection=Women" },
  { label: "Men", href: "/shop?collection=Men" },
  { label: "Personalized", href: "/shop/personalized-jewelry" },
  { label: "Stores", href: "/stores" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount } = useCart();
  const { productIds } = useWishlist();

  return (
    <header className="sticky top-0 z-40 glass-panel">
      <div className="container-luxe flex h-16 items-center justify-between sm:h-20">
        <button
          className="flex h-10 w-10 items-center justify-center lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Link href="/" className="font-display text-2xl font-semibold tracking-wide text-ink-900 dark:text-white sm:text-3xl">
          Kenyan<span className="text-gold-500"> Jewelry</span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium tracking-wide text-ink-800/80 transition-colors hover:text-gold-600 dark:text-beige-100/80 dark:hover:text-gold-300"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            aria-label="Search"
            onClick={() => setSearchOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink-900 hover:text-gold-600 dark:text-beige-100 dark:hover:text-gold-300"
          >
            <Search size={19} />
          </button>
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          <Link
            href="/account"
            aria-label="Account"
            className="hidden h-10 w-10 items-center justify-center rounded-full text-ink-900 hover:text-gold-600 dark:text-beige-100 dark:hover:text-gold-300 sm:flex"
          >
            <User size={19} />
          </Link>
          <Link
            href="/account/wishlist"
            aria-label="Wishlist"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-900 hover:text-gold-600 dark:text-beige-100 dark:hover:text-gold-300"
          >
            <Heart size={19} />
            {productIds.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold-500 text-[10px] font-semibold text-white">
                {productIds.length}
              </span>
            )}
          </Link>
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-900 hover:text-gold-600 dark:text-beige-100 dark:hover:text-gold-300"
          >
            <ShoppingBag size={19} />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold-500 text-[10px] font-semibold text-white">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-ink-900/10 bg-white/90 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-ink-900/90">
          <form action="/shop" className="container-luxe flex items-center gap-3">
            <Search size={18} className="text-ink-500 dark:text-beige-100/60" />
            <input
              name="search"
              autoFocus
              placeholder="Search rings, necklaces, gemstones, price..."
              className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-ink-500/60 dark:placeholder:text-beige-100/40"
            />
          </form>
        </div>
      )}

      <div
        className={cn(
          "overflow-hidden border-t border-ink-900/10 bg-white transition-[max-height] duration-300 dark:border-white/10 dark:bg-ink-900 lg:hidden",
          mobileOpen ? "max-h-[70vh] overflow-y-auto" : "max-h-0"
        )}
      >
        <nav className="container-luxe flex flex-col gap-1 py-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-2 py-3 text-sm font-medium text-ink-800 hover:bg-beige-100 dark:text-beige-100 dark:hover:bg-ink-800"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 border-t border-ink-900/10 pt-2 dark:border-white/10">
            <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-beige-100/50">Categories</p>
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/shop/${c.slug}`}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-2 py-2.5 text-sm text-ink-700 hover:bg-beige-100 dark:text-beige-100/80 dark:hover:bg-ink-800"
              >
                {c.name}
              </Link>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-ink-900/10 px-2 pt-3 dark:border-white/10">
            <Link href="/account" className="flex items-center gap-2 text-sm font-medium">
              <User size={16} /> My Account
            </Link>
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
