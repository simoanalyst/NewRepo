import type { Metadata } from "next";
import { Clock, MapPin, Phone } from "lucide-react";
import { stores } from "@/data/stores";

export const metadata: Metadata = {
  title: "Store Locations",
  description: "Visit our showrooms in Nairobi, Mombasa, and Kisumu for in-person styling and professional ring sizing.",
};

export default function StoresPage() {
  return (
    <div className="container-luxe py-14">
      <div className="text-center">
        <h1 className="section-heading">Visit Our Showrooms</h1>
        <p className="section-subheading mx-auto">Experience our craftsmanship in person across Kenya.</p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {stores.map((s) => (
          <div key={s.id} className="card-luxe overflow-hidden">
            <iframe
              title={s.name}
              src={`https://maps.google.com/maps?q=${s.lat},${s.lng}&z=15&output=embed`}
              className="h-48 w-full border-0"
              loading="lazy"
            />
            <div className="p-5">
              {s.isFlagship && <span className="mb-1 inline-block text-[10px] font-semibold uppercase tracking-wider text-gold-600">Flagship Store</span>}
              <p className="font-display text-lg font-semibold">{s.name}</p>
              <div className="mt-2 flex items-start gap-2 text-sm text-ink-700/75 dark:text-beige-100/70">
                <MapPin size={15} className="mt-0.5 shrink-0 text-gold-500" /> {s.address}
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm text-ink-700/75 dark:text-beige-100/70">
                <Clock size={15} className="shrink-0 text-gold-500" /> {s.hours}
              </div>
              <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="mt-2 flex items-center gap-2 text-sm text-gold-600 hover:underline">
                <Phone size={15} /> {s.phone}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
