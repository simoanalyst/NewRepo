import Image from "next/image";
import { Quote } from "lucide-react";
import { testimonials } from "@/data/testimonials";
import { StarRating } from "@/components/ui/StarRating";

export function Testimonials() {
  return (
    <section className="bg-beige-50 py-14 dark:bg-ink-800 sm:py-20">
      <div className="container-luxe">
        <div className="text-center">
          <h2 className="section-heading">Loved by Customers Across Kenya</h2>
          <p className="section-subheading mx-auto">Real stories from real customers who trusted us with their special moments.</p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.id} className="card-luxe flex flex-col gap-4 p-6">
              <Quote className="text-gold-400" size={22} />
              <p className="flex-1 text-sm leading-relaxed text-ink-700/85 dark:text-beige-100/80">&ldquo;{t.comment}&rdquo;</p>
              <StarRating rating={t.rating} />
              <div className="flex items-center gap-3 border-t border-ink-900/10 pt-4 dark:border-white/10">
                <div className="relative h-10 w-10 overflow-hidden rounded-full">
                  <Image src={t.avatarUrl} alt={t.name} fill className="object-cover" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-ink-700/60 dark:text-beige-100/60">{t.location}{t.productName ? ` · ${t.productName}` : ""}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
