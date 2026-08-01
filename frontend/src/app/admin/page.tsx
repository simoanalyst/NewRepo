"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, DollarSign, Package, ShoppingCart, Star, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { formatKes } from "@/lib/format";
import { products } from "@/data/products";

interface Stats {
  totalRevenueKes: number;
  ordersLast30Days: number;
  customerCount: number;
  productCount: number;
  lowStockCount: number;
  pendingReviewCount: number;
}

const FALLBACK: Stats = {
  totalRevenueKes: products.reduce((sum, p) => sum + p.priceKes * 3, 0),
  ordersLast30Days: 47,
  customerCount: 312,
  productCount: products.length,
  lowStockCount: products.filter((p) => p.stockQuantity < 8).length,
  pendingReviewCount: 5,
};

export default function AdminOverviewPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<Stats>(FALLBACK);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!token) return;
    apiFetch<Stats>("/admin/stats", { token })
      .then((data) => {
        setStats(data);
        setIsLive(true);
      })
      .catch(() => setIsLive(false));
  }, [token]);

  const cards = [
    { label: "Total Revenue", value: formatKes(stats.totalRevenueKes), icon: DollarSign },
    { label: "Orders (30 days)", value: stats.ordersLast30Days, icon: ShoppingCart },
    { label: "Customers", value: stats.customerCount, icon: Users },
    { label: "Products", value: stats.productCount, icon: Package },
    { label: "Low Stock Alerts", value: stats.lowStockCount, icon: AlertTriangle },
    { label: "Pending Reviews", value: stats.pendingReviewCount, icon: Star },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Dashboard Overview</h1>
        <span className="rounded-full bg-beige-100 px-3 py-1 text-xs font-medium dark:bg-ink-700">
          {isLive ? "Live data" : "Demo data (backend not connected)"}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <div key={c.label} className="card-luxe p-4">
            <c.icon size={20} className="text-gold-500" />
            <p className="mt-2 text-lg font-semibold">{c.value}</p>
            <p className="text-xs text-ink-700/60 dark:text-beige-100/60">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
