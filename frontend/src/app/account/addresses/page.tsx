"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";

interface Address {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  county: string;
  town: string;
  estate?: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const { user, token, loading } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ label: "Home", recipientName: "", phone: "", county: "", town: "", estate: "" });

  useEffect(() => {
    if (!token) return;
    apiFetch<Address[]>("/addresses", { token })
      .then(setAddresses)
      .catch(() => setError("Couldn't load addresses — is the backend API running?"));
  }, [token]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    try {
      const created = await apiFetch<Address>("/addresses", { method: "POST", token, body: JSON.stringify(form) });
      setAddresses((prev) => [...prev, created]);
      setFormOpen(false);
    } catch {
      setError("Couldn't save address — is the backend API running?");
    }
  }

  if (loading) return null;

  if (!user) {
    return (
      <div className="container-luxe py-24 text-center">
        <p className="text-ink-700/70 dark:text-beige-100/60">Please sign in to manage addresses.</p>
        <Link href="/account/login" className="btn-gold mt-6 inline-flex">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="container-luxe py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="section-heading">Saved Addresses</h1>
        <button onClick={() => setFormOpen((v) => !v)} className="btn-secondary">
          <Plus size={16} /> Add Address
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {formOpen && (
        <form onSubmit={handleAdd} className="card-luxe mt-6 grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
          <input required placeholder="Label (e.g. Home)" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="input-luxe" />
          <input required placeholder="Recipient name" value={form.recipientName} onChange={(e) => setForm({ ...form, recipientName: e.target.value })} className="input-luxe" />
          <input required placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-luxe" />
          <input required placeholder="County" value={form.county} onChange={(e) => setForm({ ...form, county: e.target.value })} className="input-luxe" />
          <input required placeholder="Town" value={form.town} onChange={(e) => setForm({ ...form, town: e.target.value })} className="input-luxe" />
          <input placeholder="Estate / street" value={form.estate} onChange={(e) => setForm({ ...form, estate: e.target.value })} className="input-luxe" />
          <button type="submit" className="btn-gold sm:col-span-2">
            Save Address
          </button>
        </form>
      )}

      {addresses.length === 0 && !formOpen ? (
        <div className="mt-10 flex flex-col items-center py-14 text-center">
          <MapPin size={40} className="text-gold-500" />
          <p className="mt-3 text-ink-700/70 dark:text-beige-100/60">No saved addresses yet.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <div key={a.id} className="card-luxe p-5">
              <p className="font-semibold">{a.label}</p>
              <p className="text-sm text-ink-700/70 dark:text-beige-100/60">
                {a.recipientName} · {a.phone}
              </p>
              <p className="text-sm text-ink-700/70 dark:text-beige-100/60">
                {a.estate ? `${a.estate}, ` : ""}
                {a.town}, {a.county}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
