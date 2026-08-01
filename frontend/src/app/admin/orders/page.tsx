"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { formatDate, formatKes } from "@/lib/format";

interface AdminOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalKes: number;
  createdAt: string;
  user: { firstName: string; lastName: string; phone: string };
  payment?: { method: string; status: string };
}

export default function AdminOrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    apiFetch<AdminOrder[]>("/orders/admin/all", { token })
      .then(setOrders)
      .catch(() => setError("Couldn't reach the backend API. Start the Express server to see live orders."));
  }, [token]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Orders</h1>

      {error && <p className="mt-4 rounded-lg bg-beige-100 p-4 text-sm text-ink-700 dark:bg-ink-700 dark:text-beige-100/80">{error}</p>}

      {!error && (
        <div className="mt-6 overflow-x-auto rounded-xl2 border border-ink-900/10 bg-white dark:border-white/10 dark:bg-ink-900">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink-900/10 bg-beige-50 text-xs uppercase tracking-wider text-ink-700/60 dark:border-white/10 dark:bg-ink-800 dark:text-beige-100/50">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900/10 dark:divide-white/10">
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-ink-700/50 dark:text-beige-100/40">
                    No orders yet.
                  </td>
                </tr>
              )}
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-3 font-medium">{o.orderNumber}</td>
                  <td className="px-4 py-3">
                    {o.user.firstName} {o.user.lastName}
                  </td>
                  <td className="px-4 py-3">{o.payment?.method.replace(/_/g, " ") ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-beige-100 px-2.5 py-1 text-xs font-medium dark:bg-ink-700">{o.status.replace(/_/g, " ")}</span>
                  </td>
                  <td className="px-4 py-3">{formatKes(o.totalKes)}</td>
                  <td className="px-4 py-3 text-ink-700/60 dark:text-beige-100/50">{formatDate(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
