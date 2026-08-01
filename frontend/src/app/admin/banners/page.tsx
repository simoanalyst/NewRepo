"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";

interface Banner {
  id: string;
  title: string;
  placement: string;
  isActive: boolean;
}

interface Coupon {
  id: string;
  code: string;
  percentOff?: number;
  amountOffKes?: number;
  isActive: boolean;
  timesRedeemed: number;
}

export default function AdminBannersPage() {
  const { token } = useAuth();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    Promise.all([apiFetch<Banner[]>("/banners", { token }), apiFetch<Coupon[]>("/coupons", { token })])
      .then(([b, c]) => {
        setBanners(b);
        setCoupons(c);
      })
      .catch(() => setError("Couldn't reach the backend API. Start the Express server to manage live banners & coupons."));
  }, [token]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl font-semibold">Homepage Banners</h1>
        {error && <p className="mt-4 rounded-lg bg-beige-100 p-4 text-sm text-ink-700 dark:bg-ink-700 dark:text-beige-100/80">{error}</p>}
        {!error && (
          <div className="mt-4 space-y-3">
            {banners.length === 0 && <p className="text-sm text-ink-700/60 dark:text-beige-100/50">No banners configured yet.</p>}
            {banners.map((b) => (
              <div key={b.id} className="card-luxe flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{b.title}</p>
                  <p className="text-xs text-ink-700/60 dark:text-beige-100/50">{b.placement}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${b.isActive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-beige-100 dark:bg-ink-700"}`}>
                  {b.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-display text-2xl font-semibold">Coupons</h2>
        {!error && (
          <div className="mt-4 overflow-x-auto rounded-xl2 border border-ink-900/10 bg-white dark:border-white/10 dark:bg-ink-900">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ink-900/10 bg-beige-50 text-xs uppercase tracking-wider text-ink-700/60 dark:border-white/10 dark:bg-ink-800 dark:text-beige-100/50">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Discount</th>
                  <th className="px-4 py-3">Redeemed</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-900/10 dark:divide-white/10">
                {coupons.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-ink-700/50 dark:text-beige-100/40">
                      No coupons yet.
                    </td>
                  </tr>
                )}
                {coupons.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-3 font-medium">{c.code}</td>
                    <td className="px-4 py-3">{c.percentOff ? `${c.percentOff}%` : c.amountOffKes ? `KES ${c.amountOffKes}` : "—"}</td>
                    <td className="px-4 py-3">{c.timesRedeemed}</td>
                    <td className="px-4 py-3">{c.isActive ? "Active" : "Inactive"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
