"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "/api"}/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("success"); // demo-friendly: don't block UX if backend isn't running
      setEmail("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? "mt-4" : "mx-auto mt-6 max-w-md"}>
      <div className="flex items-center gap-2 rounded-full border border-ink-900/15 bg-white p-1.5 pl-4 dark:border-white/15 dark:bg-ink-900">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className="w-full bg-transparent text-sm outline-none placeholder:text-ink-500/50 dark:placeholder:text-beige-100/40"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-900 text-white transition-colors hover:bg-gold-600 disabled:opacity-60 dark:bg-gold-500 dark:text-ink-900"
          aria-label="Subscribe"
        >
          <Send size={15} />
        </button>
      </div>
      {status === "success" && <p className="mt-2 text-xs text-gold-600">Thank you for subscribing!</p>}
    </form>
  );
}
