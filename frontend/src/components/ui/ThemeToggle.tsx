"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-900/10 text-ink-900 transition-colors hover:border-gold-500 hover:text-gold-600 dark:border-white/15 dark:text-beige-100 dark:hover:border-gold-400 dark:hover:text-gold-300"
    >
      {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
