import Link from "next/link";
import { Smartphone } from "lucide-react";

export function PromoBanner() {
  return (
    <section className="bg-gold-gradient py-10">
      <div className="container-luxe flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
        <div className="flex items-center gap-3 text-white">
          <Smartphone size={26} />
          <div>
            <p className="font-display text-xl font-semibold">Free Delivery on Orders Above KES 15,000</p>
            <p className="text-sm text-white/90">Pay instantly with M-Pesa STK Push, Airtel Money, or Card.</p>
          </div>
        </div>
        <Link href="/shop" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-gold-700 transition-transform hover:scale-105">
          Shop Now
        </Link>
      </div>
    </section>
  );
}
