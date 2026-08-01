"use client";

import { useState } from "react";
import Image from "next/image";
import { RotateCw, ZoomIn } from "lucide-react";
import { ProductImage } from "@/types";
import { cn } from "@/lib/cn";

export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const current = images[active];

  return (
    <div>
      <div
        className="group relative aspect-square overflow-hidden rounded-xl2 border border-ink-900/10 bg-beige-100 dark:border-white/10 dark:bg-ink-700"
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
      >
        <Image
          src={current.url}
          alt={current.altText}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className={cn("object-cover transition-transform duration-500", zoomed && "scale-125")}
        />
        {current.is360 && (
          <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-ink-900/80 px-3 py-1.5 text-[11px] font-medium text-white">
            <RotateCw size={12} /> 360° View
          </span>
        )}
        <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-medium text-ink-900 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-ink-900/80 dark:text-white">
          <ZoomIn size={12} /> Hover to zoom
        </span>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
        {images.map((img, i) => (
          <button
            key={img.url + i}
            onClick={() => setActive(i)}
            className={cn(
              "relative aspect-square overflow-hidden rounded-lg border-2 transition-colors",
              active === i ? "border-gold-500" : "border-transparent"
            )}
          >
            <Image src={img.url} alt={`${name} thumbnail ${i + 1}`} fill sizes="120px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
