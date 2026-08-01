import { cn } from "@/lib/cn";

const VARIANTS = {
  gold: "bg-gold-gradient text-white",
  dark: "bg-ink-900 text-white dark:bg-white dark:text-ink-900",
  outline: "border border-ink-900/15 text-ink-800 dark:border-white/20 dark:text-beige-100",
  danger: "bg-red-600 text-white",
};

export function Badge({ children, variant = "dark", className }: { children: React.ReactNode; variant?: keyof typeof VARIANTS; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider", VARIANTS[variant], className)}>
      {children}
    </span>
  );
}
