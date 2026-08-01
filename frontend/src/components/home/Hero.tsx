import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Smartphone, Truck } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink-900">
      <Image
        src="https://placehold.co/1920x1080/18181a/e0bd71?text=Kenyan+Jewelry"
        alt="Elegant handcrafted Kenyan jewelry"
        fill
        priority
        className="object-cover opacity-50"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/60 to-ink-900/20" />

      <div className="container-luxe relative flex min-h-[78vh] flex-col justify-center py-20 text-center sm:min-h-[85vh]">
        <p className="mx-auto mb-4 inline-block animate-fade-in rounded-full border border-gold-400/40 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-gold-300">
          Handcrafted in Nairobi
        </p>
        <h1 className="animate-slide-up font-display text-4xl font-medium leading-tight text-white sm:text-6xl lg:text-7xl">
          Timeless Elegance,
          <br className="hidden sm:block" /> Crafted for <span className="text-gold-400">You</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl animate-slide-up text-sm text-beige-100/80 sm:text-base" style={{ animationDelay: "0.1s" }}>
          Certified gold, diamonds & gemstones. Pay instantly with M-Pesa. Delivered nationwide across Kenya.
        </p>

        <div className="mt-8 flex animate-slide-up flex-col items-center justify-center gap-3 sm:flex-row" style={{ animationDelay: "0.2s" }}>
          <Link href="/shop" className="btn-gold w-full sm:w-auto">
            Shop the Collection
          </Link>
          <Link href="/shop/engagement-rings" className="btn-secondary w-full !border-white/30 !text-white hover:!border-gold-400 hover:!text-gold-300 sm:w-auto">
            Engagement Rings
          </Link>
        </div>

        <div className="mx-auto mt-12 grid max-w-2xl animate-fade-in grid-cols-3 gap-4 border-t border-white/10 pt-8" style={{ animationDelay: "0.3s" }}>
          <div className="flex flex-col items-center gap-2 text-white/80">
            <ShieldCheck size={20} className="text-gold-400" />
            <span className="text-[11px] sm:text-xs">Authenticity Guaranteed</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-white/80">
            <Smartphone size={20} className="text-gold-400" />
            <span className="text-[11px] sm:text-xs">M-Pesa Instant Checkout</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-white/80">
            <Truck size={20} className="text-gold-400" />
            <span className="text-[11px] sm:text-xs">Nationwide Delivery</span>
          </div>
        </div>
      </div>
    </section>
  );
}
