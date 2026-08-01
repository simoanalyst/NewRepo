"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user || !["ADMIN", "MANAGER", "SUPPORT"].includes(user.role)) {
    return (
      <div className="container-luxe flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="section-heading">Admin Access Required</h1>
        <p className="section-subheading mx-auto">Sign in with an administrator account to manage the store.</p>
        <Link href="/account/login" className="btn-gold mt-6">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row">
      <AdminSidebar />
      <main className="flex-1 bg-beige-50 p-6 dark:bg-ink-800 lg:min-h-screen">{children}</main>
    </div>
  );
}
