"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/format";

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  phoneVerified: boolean;
  createdAt: string;
  _count: { orders: number };
}

export default function AdminCustomersPage() {
  const { token } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    apiFetch<Customer[]>("/admin/customers", { token })
      .then(setCustomers)
      .catch(() => setError("Couldn't reach the backend API. Start the Express server to see live customers."));
  }, [token]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Customers</h1>

      {error && <p className="mt-4 rounded-lg bg-beige-100 p-4 text-sm text-ink-700 dark:bg-ink-700 dark:text-beige-100/80">{error}</p>}

      {!error && (
        <div className="mt-6 overflow-x-auto rounded-xl2 border border-ink-900/10 bg-white dark:border-white/10 dark:bg-ink-900">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink-900/10 bg-beige-50 text-xs uppercase tracking-wider text-ink-700/60 dark:border-white/10 dark:bg-ink-800 dark:text-beige-100/50">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Verified</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900/10 dark:divide-white/10">
              {customers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-ink-700/50 dark:text-beige-100/40">
                    No customers yet.
                  </td>
                </tr>
              )}
              {customers.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-medium">
                    {c.firstName} {c.lastName}
                  </td>
                  <td className="px-4 py-3">{c.phone}</td>
                  <td className="px-4 py-3 text-ink-700/60 dark:text-beige-100/50">{c.email ?? "—"}</td>
                  <td className="px-4 py-3">{c.phoneVerified ? "Yes" : "No"}</td>
                  <td className="px-4 py-3">{c._count.orders}</td>
                  <td className="px-4 py-3 text-ink-700/60 dark:text-beige-100/50">{formatDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
