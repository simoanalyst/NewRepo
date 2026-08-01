"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register(form);
      router.push("/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to register. Please check your backend is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-luxe flex min-h-[70vh] items-center justify-center py-14">
      <div className="w-full max-w-sm">
        <h1 className="section-heading text-center">Create Your Account</h1>
        <p className="section-subheading mx-auto text-center">Join for faster checkout, order tracking, and exclusive offers.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input required placeholder="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="input-luxe" />
            <input required placeholder="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="input-luxe" />
          </div>
          <input required placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-luxe" />
          <input type="email" placeholder="Email (optional)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-luxe" />
          <input required type="password" placeholder="Password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-luxe" />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-60">
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-700/70 dark:text-beige-100/60">
          Already have an account?{" "}
          <Link href="/account/login" className="font-medium text-gold-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
