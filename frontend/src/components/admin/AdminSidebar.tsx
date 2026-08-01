"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gem, LayoutDashboard, LogOut, MessageSquareText, Percent, ShoppingCart, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Gem },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquareText },
  { href: "/admin/banners", label: "Banners & Coupons", icon: Percent },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-full shrink-0 border-b border-ink-900/10 bg-white dark:border-white/10 dark:bg-ink-900 lg:h-screen lg:w-64 lg:border-b-0 lg:border-r">
      <div className="p-6">
        <p className="font-display text-xl font-semibold">Admin Panel</p>
        <p className="text-xs text-ink-700/60 dark:text-beige-100/50">{user?.firstName} {user?.lastName}</p>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              pathname === item.href ? "bg-gold-500 text-white" : "text-ink-700 hover:bg-beige-100 dark:text-beige-100/80 dark:hover:bg-ink-800"
            )}
          >
            <item.icon size={16} /> {item.label}
          </Link>
        ))}
      </nav>
      <button onClick={logout} className="mx-3 mb-4 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-ink-700 hover:bg-beige-100 dark:text-beige-100/80 dark:hover:bg-ink-800">
        <LogOut size={16} /> Sign Out
      </button>
    </aside>
  );
}
