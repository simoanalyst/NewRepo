"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { getFilterOptions } from "@/lib/filterProducts";
import { formatKes } from "@/lib/format";
import { cn } from "@/lib/cn";

function useQueryParam(key: string) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const value = searchParams.get(key);

  const setValue = (next: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set(key, next);
    else params.delete(key);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return [value, setValue] as const;
}

function useMultiQueryParam(key: string) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const values = searchParams.get(key)?.split(",").filter(Boolean) ?? [];

  const toggle = (val: string) => {
    const next = values.includes(val) ? values.filter((v) => v !== val) : [...values, val];
    const params = new URLSearchParams(searchParams.toString());
    if (next.length) params.set(key, next.join(","));
    else params.delete(key);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return [values, toggle] as const;
}

function FilterGroup({ title, options, selected, onToggle }: { title: string; options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  if (options.length === 0) return null;
  return (
    <div className="border-b border-ink-900/10 py-5 dark:border-white/10">
      <p className="text-sm font-semibold">{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onToggle(opt)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition-colors",
              selected.includes(opt)
                ? "border-gold-500 bg-gold-500 text-white"
                : "border-ink-900/15 text-ink-700 hover:border-gold-400 dark:border-white/15 dark:text-beige-100/80"
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ProductFilters() {
  const options = getFilterOptions();
  const [material, toggleMaterial] = useMultiQueryParam("material");
  const [gemstone, toggleGemstone] = useMultiQueryParam("gemstone");
  const [color, toggleColor] = useMultiQueryParam("color");
  const [ringSize, toggleRingSize] = useMultiQueryParam("ringSize");
  const [inStockOnly, setInStockOnly] = useQueryParam("inStockOnly");
  const [minPrice, setMinPrice] = useQueryParam("minPrice");
  const [maxPrice, setMaxPrice] = useQueryParam("maxPrice");
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCount = material.length + gemstone.length + color.length + ringSize.length + (inStockOnly ? 1 : 0) + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0);

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    ["material", "gemstone", "color", "ringSize", "inStockOnly", "minPrice", "maxPrice"].forEach((k) => params.delete(k));
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const body = (
    <div>
      <div className="flex items-center justify-between border-b border-ink-900/10 pb-4 dark:border-white/10">
        <p className="font-display text-xl font-semibold">Filters</p>
        {activeCount > 0 && (
          <button onClick={clearAll} className="text-xs font-medium text-gold-600 hover:underline">
            Clear all ({activeCount})
          </button>
        )}
      </div>

      <div className="border-b border-ink-900/10 py-5 dark:border-white/10">
        <p className="text-sm font-semibold">Price (KES)</p>
        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            placeholder={formatKes(options.minPrice)}
            defaultValue={minPrice ?? ""}
            onBlur={(e) => setMinPrice(e.target.value || null)}
            className="w-full rounded-lg border border-ink-900/15 bg-transparent px-3 py-2 text-xs dark:border-white/15"
          />
          <span className="text-ink-500">–</span>
          <input
            type="number"
            placeholder={formatKes(options.maxPrice)}
            defaultValue={maxPrice ?? ""}
            onBlur={(e) => setMaxPrice(e.target.value || null)}
            className="w-full rounded-lg border border-ink-900/15 bg-transparent px-3 py-2 text-xs dark:border-white/15"
          />
        </div>
      </div>

      <FilterGroup title="Material" options={options.materials} selected={material} onToggle={toggleMaterial} />
      <FilterGroup title="Gemstone" options={options.gemstones} selected={gemstone} onToggle={toggleGemstone} />
      <FilterGroup title="Color" options={options.colors} selected={color} onToggle={toggleColor} />
      <FilterGroup title="Ring Size" options={options.ringSizes} selected={ringSize} onToggle={toggleRingSize} />

      <div className="py-5">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={Boolean(inStockOnly)}
            onChange={(e) => setInStockOnly(e.target.checked ? "true" : null)}
            className="h-4 w-4 accent-gold-500"
          />
          In stock only
        </label>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="mb-4 flex items-center gap-2 rounded-full border border-ink-900/15 px-4 py-2 text-sm font-medium lg:hidden dark:border-white/15"
      >
        <SlidersHorizontal size={15} /> Filters {activeCount > 0 && `(${activeCount})`}
      </button>

      <aside className="hidden w-64 shrink-0 lg:block">{body}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative ml-auto h-full w-80 max-w-[85vw] overflow-y-auto bg-white p-5 dark:bg-ink-900">
            <button onClick={() => setMobileOpen(false)} className="absolute right-4 top-4">
              <X size={20} />
            </button>
            <div className="mt-8">{body}</div>
          </div>
        </div>
      )}
    </>
  );
}
