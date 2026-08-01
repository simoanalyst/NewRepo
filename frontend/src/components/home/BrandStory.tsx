import Image from "next/image";
import Link from "next/link";

export function BrandStory() {
  return (
    <section className="py-14 sm:py-20">
      <div className="container-luxe grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl2 shadow-luxe">
          <Image
            src="https://placehold.co/1000x750/f5efe6/1a1a1a?text=Our+Nairobi+Workshop"
            alt="Kenyan Jewelry artisans at work in our Nairobi workshop"
            fill
            className="object-cover"
          />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">Our Story</p>
          <h2 className="section-heading mt-2">Crafted by Kenyan Hands, Worn Around the World</h2>
          <p className="mt-4 text-sm leading-relaxed text-ink-700/80 dark:text-beige-100/70 sm:text-base">
            Founded in Nairobi, Kenyan Jewelry Co. brings together a collective of master goldsmiths and gemologists
            dedicated to a singular purpose: creating pieces that honor both timeless craftsmanship and modern Kenyan
            identity. Every ring, necklace, and bracelet is inspected by hand before it reaches you — because your
            milestones deserve nothing less than exceptional quality.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-ink-900/10 pt-6 dark:border-white/10">
            <div>
              <p className="font-display text-2xl font-semibold text-gold-600">12+</p>
              <p className="text-xs text-ink-700/60 dark:text-beige-100/60">Years of Craft</p>
            </div>
            <div>
              <p className="font-display text-2xl font-semibold text-gold-600">40k+</p>
              <p className="text-xs text-ink-700/60 dark:text-beige-100/60">Happy Customers</p>
            </div>
            <div>
              <p className="font-display text-2xl font-semibold text-gold-600">3</p>
              <p className="text-xs text-ink-700/60 dark:text-beige-100/60">Showrooms in Kenya</p>
            </div>
          </div>
          <Link href="/about" className="btn-secondary mt-7 inline-flex">
            Discover Our Story
          </Link>
        </div>
      </div>
    </section>
  );
}
