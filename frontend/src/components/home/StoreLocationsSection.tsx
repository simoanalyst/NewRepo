import Link from "next/link";
import { Clock, MapPin, Phone } from "lucide-react";
import { stores } from "@/data/stores";

export function StoreLocationsSection() {
  return (
    <section className="py-14 sm:py-20">
      <div className="container-luxe">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="section-heading">Visit a Showroom Near You</h2>
            <p className="section-subheading">Experience our pieces in person, or book a personal styling session.</p>
          </div>
          <Link href="/stores" className="btn-secondary">
            View All Locations
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((s) => (
            <div key={s.id} className="card-luxe p-6">
              {s.isFlagship && <span className="mb-2 inline-block text-[10px] font-semibold uppercase tracking-wider text-gold-600">Flagship Store</span>}
              <p className="font-display text-lg font-semibold">{s.name}</p>
              <div className="mt-3 flex items-start gap-2 text-sm text-ink-700/75 dark:text-beige-100/70">
                <MapPin size={15} className="mt-0.5 shrink-0 text-gold-500" /> {s.address}
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm text-ink-700/75 dark:text-beige-100/70">
                <Clock size={15} className="shrink-0 text-gold-500" /> {s.hours}
              </div>
              <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="mt-2 flex items-center gap-2 text-sm text-gold-600 hover:underline">
                <Phone size={15} /> {s.phone}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
