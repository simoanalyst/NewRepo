"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(phone, password);
      router.push("/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in. Please check your backend is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-luxe flex min-h-[70vh] items-center justify-center py-14">
      <div className="w-full max-w-sm">
        <h1 className="section-heading text-center">Welcome Back</h1>
        <p className="section-subheading mx-auto text-center">Sign in to track orders, manage your wishlist, and more.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input required placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-luxe" />
          <input required type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-luxe" />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-60">
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-700/70 dark:text-beige-100/60">
          New here?{" "}
          <Link href="/account/register" className="font-medium text-gold-600 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
