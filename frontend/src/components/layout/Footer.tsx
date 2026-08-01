import Link from "next/link";
import { Facebook, Instagram, Music2, ShieldCheck, Truck, Undo2 } from "lucide-react";
import { BUSINESS_REG_NUMBER, SITE_NAME } from "@/lib/constants";
import { NewsletterForm } from "@/components/home/NewsletterForm";

const SHOP_LINKS = [
  { label: "Engagement Rings", href: "/shop/engagement-rings" },
  { label: "Wedding Bands", href: "/shop/wedding-bands" },
  { label: "Necklaces", href: "/shop/necklaces" },
  { label: "Earrings", href: "/shop/earrings" },
  { label: "Watches", href: "/shop/watches" },
  { label: "Gift Sets", href: "/shop/gift-sets" },
];

const HELP_LINKS = [
  { label: "Contact Us", href: "/contact" },
  { label: "FAQs", href: "/faq" },
  { label: "Store Locations", href: "/stores" },
  { label: "Size Guide", href: "/faq#size-guide" },
  { label: "Track My Order", href: "/account/orders" },
  { label: "Book a Consultation", href: "/contact#consultation" },
];

const POLICY_LINKS = [
  { label: "Privacy Policy", href: "/policies/privacy" },
  { label: "Terms & Conditions", href: "/policies/terms" },
  { label: "Returns & Exchanges", href: "/policies/returns" },
  { label: "Shipping & Delivery", href: "/policies/shipping" },
  { label: "Warranty", href: "/policies/warranty" },
];

export function Footer() {
  return (
    <footer className="border-t border-ink-900/10 bg-beige-50 dark:border-white/10 dark:bg-ink-800">
      <div className="container-luxe grid grid-cols-1 gap-x-6 gap-y-10 py-10 sm:grid-cols-3 sm:py-14 lg:grid-cols-6">
        <div className="flex items-center gap-3 rounded-xl2 border border-ink-900/10 bg-white p-4 dark:border-white/10 dark:bg-ink-900">
          <ShieldCheck className="shrink-0 text-gold-500" size={26} />
          <div>
            <p className="text-sm font-semibold">Authenticity Guaranteed</p>
            <p className="text-xs text-ink-700/60 dark:text-beige-100/60">Certified materials & gemstones</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl2 border border-ink-900/10 bg-white p-4 dark:border-white/10 dark:bg-ink-900">
          <Truck className="shrink-0 text-gold-500" size={26} />
          <div>
            <p className="text-sm font-semibold">Nationwide Delivery</p>
            <p className="text-xs text-ink-700/60 dark:text-beige-100/60">Free above KES 15,000</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl2 border border-ink-900/10 bg-white p-4 dark:border-white/10 dark:bg-ink-900 sm:col-span-1">
          <Undo2 className="shrink-0 text-gold-500" size={26} />
          <div>
            <p className="text-sm font-semibold">7-Day Returns</p>
            <p className="text-xs text-ink-700/60 dark:text-beige-100/60">Easy exchange, no hassle</p>
          </div>
        </div>

        <div className="col-span-full grid grid-cols-2 gap-8 border-t border-ink-900/10 pt-10 dark:border-white/10 sm:grid-cols-4">
          <div>
            <p className="font-display text-xl text-ink-900 dark:text-white">{SITE_NAME}</p>
            <p className="mt-3 text-sm text-ink-700/70 dark:text-beige-100/70">
              Handcrafted luxury jewelry, designed and assembled in Nairobi. Certified materials, transparent KES pricing, and
              nationwide M-Pesa checkout.
            </p>
            <div className="mt-4 flex gap-3">
              <a href="#" aria-label="Facebook" className="text-ink-700 hover:text-gold-600 dark:text-beige-100/70">
                <Facebook size={18} />
              </a>
              <a href="#" aria-label="Instagram" className="text-ink-700 hover:text-gold-600 dark:text-beige-100/70">
                <Instagram size={18} />
              </a>
              <a href="#" aria-label="TikTok" className="text-ink-700 hover:text-gold-600 dark:text-beige-100/70">
                <Music2 size={18} />
              </a>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-ink-900 dark:text-white">Shop</p>
            <ul className="mt-4 space-y-2.5">
              {SHOP_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-ink-700/70 hover:text-gold-600 dark:text-beige-100/70">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-ink-900 dark:text-white">Help</p>
            <ul className="mt-4 space-y-2.5">
              {HELP_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-ink-700/70 hover:text-gold-600 dark:text-beige-100/70">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-ink-900 dark:text-white">Stay Updated</p>
            <p className="mt-4 text-sm text-ink-700/70 dark:text-beige-100/70">Get early access to new collections and offers.</p>
            <NewsletterForm compact />
          </div>
        </div>

        <div className="col-span-full flex flex-col gap-3 border-t border-ink-900/10 pt-6 text-xs text-ink-700/60 dark:border-white/10 dark:text-beige-100/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved. Business Reg. No. {BUSINESS_REG_NUMBER}.
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {POLICY_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-gold-600">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
