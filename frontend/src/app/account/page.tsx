"use client";

import Link from "next/link";
import { Heart, LogOut, MapPin, Package, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AccountPage() {
  const { user, loading, logout } = useAuth();

  if (loading) return null;

  if (!user) {
    return (
      <div className="container-luxe flex min-h-[60vh] flex-col items-center justify-center py-14 text-center">
        <User size={40} className="text-gold-500" />
        <h1 className="section-heading mt-3">You're Not Signed In</h1>
        <p className="section-subheading mx-auto">Sign in to view your orders, wishlist, and saved addresses.</p>
        <div className="mt-6 flex gap-3">
          <Link href="/account/login" className="btn-gold">
            Sign In
          </Link>
          <Link href="/account/register" className="btn-secondary">
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  const links = [
    { href: "/account/orders", label: "My Orders", icon: Package, description: "Track orders & download invoices" },
    { href: "/account/wishlist", label: "Wishlist", icon: Heart, description: "Items you've saved for later" },
    { href: "/account/addresses", label: "Saved Addresses", icon: MapPin, description: "Manage delivery addresses" },
  ];

  return (
    <div className="container-luxe py-10">
      <h1 className="section-heading">
        Welcome, {user.firstName} {user.lastName}
      </h1>
      <p className="section-subheading">{user.phone}{user.email ? ` · ${user.email}` : ""}</p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="card-luxe flex flex-col gap-2 p-6 hover:border-gold-400">
            <l.icon size={22} className="text-gold-500" />
            <p className="font-display text-lg font-semibold">{l.label}</p>
            <p className="text-xs text-ink-700/60 dark:text-beige-100/60">{l.description}</p>
          </Link>
        ))}
      </div>

      <button onClick={logout} className="btn-secondary mt-8 inline-flex items-center gap-2">
        <LogOut size={16} /> Sign Out
      </button>
    </div>
  );
}
