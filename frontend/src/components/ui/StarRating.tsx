import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

export function StarRating({ rating, size = 14, showValue = false }: { rating: number; size?: number; showValue?: boolean }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            size={size}
            className={cn(n <= Math.round(rating) ? "fill-gold-500 text-gold-500" : "fill-transparent text-ink-900/20 dark:text-white/20")}
          />
        ))}
      </div>
      {showValue && <span className="text-xs text-ink-700/60 dark:text-beige-100/60">{rating.toFixed(1)}</span>}
    </div>
  );
}
