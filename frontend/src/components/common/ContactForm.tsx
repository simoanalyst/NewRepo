"use client";

import { useState } from "react";
import { API_URL } from "@/lib/constants";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl2 border border-gold-300 bg-gold-50 p-6 text-sm text-gold-700 dark:border-gold-700 dark:bg-gold-900/10 dark:text-gold-300">
        Thank you! Your message has been sent — our team will respond within 24 hours.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-luxe" />
        <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-luxe" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <input placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-luxe" />
        <input placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="input-luxe" />
      </div>
      <textarea
        required
        rows={5}
        placeholder="How can we help? (stock availability, customization, delivery, jewelry care...)"
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        className="input-luxe resize-none"
      />
      {status === "error" && <p className="text-xs text-red-500">Couldn't send your message — please try WhatsApp instead, or check the backend is running.</p>}
      <button type="submit" disabled={status === "loading"} className="btn-gold disabled:opacity-60">
        {status === "loading" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
