import Image from "next/image";
import { Instagram } from "lucide-react";
import { products } from "@/data/products";

export function InstagramGallery() {
  const shots = products.slice(0, 6);
  return (
    <section className="py-14 sm:py-20">
      <div className="container-luxe">
        <div className="flex flex-col items-center text-center">
          <Instagram className="text-gold-500" size={28} />
          <h2 className="section-heading mt-3">Follow Us @kenyanjewelryco</h2>
          <p className="section-subheading">Tag us in your #KenyanJewelryMoments for a chance to be featured.</p>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-4 md:grid-cols-6">
          {shots.map((p) => (
            <a
              key={p.id}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-lg"
            >
              <Image src={p.images[0]?.url} alt={p.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 flex items-center justify-center bg-ink-900/0 transition-colors group-hover:bg-ink-900/40">
                <Instagram className="text-white opacity-0 transition-opacity group-hover:opacity-100" size={20} />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
