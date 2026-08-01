"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export function Accordion({ items }: { items: Array<{ question: string; answer: string }> }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-ink-900/10 dark:divide-white/10">
      {items.map((item, i) => (
        <div key={item.question}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between gap-4 py-5 text-left"
          >
            <span className="text-sm font-medium sm:text-base">{item.question}</span>
            <ChevronDown size={18} className={cn("shrink-0 text-gold-500 transition-transform", open === i && "rotate-180")} />
          </button>
          <div className={cn("grid overflow-hidden transition-all duration-300", open === i ? "grid-rows-[1fr] pb-5 opacity-100" : "grid-rows-[0fr] opacity-0")}>
            <div className="overflow-hidden">
              <p className="text-sm leading-relaxed text-ink-700/75 dark:text-beige-100/70">{item.answer}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
