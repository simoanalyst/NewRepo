import Image from "next/image";
import Link from "next/link";
import { categories } from "@/data/categories";

export function CategoryShowcase() {
  return (
    <section className="py-14 sm:py-20">
      <div className="container-luxe">
        <h2 className="section-heading">Shop by Collection</h2>
        <p className="section-subheading">From engagement to everyday elegance — find the piece that tells your story.</p>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-5">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/shop/${c.slug}`}
              className="group relative aspect-[4/5] overflow-hidden rounded-xl2 shadow-luxe"
            >
              <Image
                src={c.imageUrl}
                alt={c.name}
                fill
                sizes="(max-width: 768px) 50vw, 20vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-ink-900/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="font-display text-lg font-medium text-white sm:text-xl">{c.name}</p>
                <span className="text-xs text-gold-300 opacity-0 transition-opacity group-hover:opacity-100">Shop Now →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
