"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { formatDate, formatKes } from "@/lib/format";

interface OrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  totalKes: number;
  createdAt: string;
  trackingNumber?: string;
}

export default function OrdersPage() {
  const { user, token, loading } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    apiFetch<OrderSummary[]>("/orders/mine", { token })
      .then(setOrders)
      .catch(() => setError("Couldn't load orders — is the backend API running?"));
  }, [token]);

  if (loading) return null;

  if (!user) {
    return (
      <div className="container-luxe py-24 text-center">
        <p className="text-ink-700/70 dark:text-beige-100/60">Please sign in to view your orders.</p>
        <Link href="/account/login" className="btn-gold mt-6 inline-flex">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="container-luxe py-10">
      <h1 className="section-heading">My Orders</h1>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {!error && orders?.length === 0 && (
        <div className="mt-10 flex flex-col items-center py-14 text-center">
          <PackageSearch size={40} className="text-gold-500" />
          <p className="mt-3 text-ink-700/70 dark:text-beige-100/60">You haven't placed any orders yet.</p>
          <Link href="/shop" className="btn-gold mt-5">
            Start Shopping
          </Link>
        </div>
      )}

      {orders && orders.length > 0 && (
        <div className="mt-6 space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="card-luxe flex flex-wrap items-center justify-between gap-3 p-5">
              <div>
                <p className="font-semibold">{o.orderNumber}</p>
                <p className="text-xs text-ink-700/60 dark:text-beige-100/60">{formatDate(o.createdAt)}</p>
              </div>
              <span className="rounded-full bg-beige-100 px-3 py-1 text-xs font-medium dark:bg-ink-700">{o.status.replace(/_/g, " ")}</span>
              <p className="font-semibold">{formatKes(o.totalKes)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
