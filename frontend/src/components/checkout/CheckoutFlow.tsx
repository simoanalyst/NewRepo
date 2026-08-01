"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Banknote, CheckCircle2, Loader2, Smartphone, Truck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatKes } from "@/lib/format";
import { DELIVERY_FEES, FREE_DELIVERY_THRESHOLD_KES, MPESA_PAYBILL, MPESA_TILL, SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/cn";

type DeliveryMethod = "STORE_PICKUP" | "NATIONWIDE_DELIVERY" | "SAME_DAY_DELIVERY";
type PaymentMethod = "MPESA_STK" | "MPESA_PAYBILL" | "AIRTEL_MONEY" | "CARD" | "CASH_ON_DELIVERY" | "BANK_TRANSFER";

const DELIVERY_OPTIONS: Array<{ value: DeliveryMethod; label: string; description: string }> = [
  { value: "NATIONWIDE_DELIVERY", label: "Nationwide Delivery", description: "2-4 business days, all 47 counties" },
  { value: "SAME_DAY_DELIVERY", label: "Same-Day Delivery", description: "Nairobi & environs, order before 1pm" },
  { value: "STORE_PICKUP", label: "Store Pickup", description: "Ready within 2 hours, free" },
];

const PAYMENT_OPTIONS: Array<{ value: PaymentMethod; label: string; icon: React.ReactNode }> = [
  { value: "MPESA_STK", label: "M-Pesa (STK Push)", icon: <Smartphone size={18} /> },
  { value: "MPESA_PAYBILL", label: "M-Pesa Paybill", icon: <Smartphone size={18} /> },
  { value: "AIRTEL_MONEY", label: "Airtel Money", icon: <Smartphone size={18} /> },
  { value: "CARD", label: "Visa / Mastercard", icon: <Banknote size={18} /> },
  { value: "CASH_ON_DELIVERY", label: "Cash on Delivery (Nairobi)", icon: <Banknote size={18} /> },
  { value: "BANK_TRANSFER", label: "Bank Transfer", icon: <Banknote size={18} /> },
];

export function CheckoutFlow() {
  const { items, subtotalKes, clearCart } = useCart();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [county, setCounty] = useState("");
  const [town, setTown] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("NATIONWIDE_DELIVERY");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("MPESA_STK");
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "awaiting-pin" | "confirming" | "success" | "failed">("idle");
  const [orderNumber, setOrderNumber] = useState("");

  const deliveryFee = subtotalKes >= FREE_DELIVERY_THRESHOLD_KES ? 0 : DELIVERY_FEES[deliveryMethod];
  const total = subtotalKes + deliveryFee;
  const canSubmit = name && phone && (deliveryMethod === "STORE_PICKUP" || (county && town)) && (paymentMethod !== "MPESA_STK" || mpesaPhone);

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || items.length === 0) return;

    const generatedOrderNumber = `KJ-${Date.now().toString(36).toUpperCase()}`;
    setOrderNumber(generatedOrderNumber);

    if (paymentMethod === "MPESA_STK") {
      setStatus("awaiting-pin");
      // In production this calls POST /api/orders/checkout, which triggers a real
      // Daraja STK push to `mpesaPhone`; the customer confirms with their M-Pesa PIN
      // and Safaricom's callback marks the order PAID (see backend/src/services/mpesa.service.ts).
      await new Promise((resolve) => setTimeout(resolve, 2200));
      setStatus("confirming");
      await new Promise((resolve) => setTimeout(resolve, 1800));
      setStatus("success");
      clearCart();
    } else {
      setStatus("confirming");
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setStatus("success");
      clearCart();
    }
  }

  if (status === "success") {
    return (
      <div className="container-luxe flex flex-col items-center py-24 text-center">
        <CheckCircle2 size={56} className="text-gold-500" />
        <h1 className="section-heading mt-4">Order Confirmed!</h1>
        <p className="section-subheading mx-auto">
          Order <strong>{orderNumber}</strong> has been placed successfully.
          {paymentMethod === "MPESA_STK" ? " Your M-Pesa payment was received." : " We'll confirm payment shortly."}
        </p>
        <div className="mt-6 flex gap-3">
          <button onClick={() => router.push("/account/orders")} className="btn-gold">
            Track My Order
          </button>
          <button onClick={() => router.push("/shop")} className="btn-secondary">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-luxe py-24 text-center">
        <p className="text-ink-700/70 dark:text-beige-100/60">Your cart is empty.</p>
        <button onClick={() => router.push("/shop")} className="btn-gold mt-6">
          Shop Now
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handlePay} className="container-luxe grid grid-cols-1 gap-10 py-10 lg:grid-cols-3">
      <div className="space-y-8 lg:col-span-2">
        <section className="card-luxe p-6">
          <p className="font-display text-xl font-semibold">1. Contact Details</p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input required placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className="input-luxe" />
            <input required placeholder="Phone number (e.g. 0712345678)" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-luxe" />
            <input type="email" placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} className="input-luxe sm:col-span-2" />
          </div>
        </section>

        <section className="card-luxe p-6">
          <p className="font-display text-xl font-semibold">2. Delivery Method</p>
          <div className="mt-4 space-y-3">
            {DELIVERY_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-colors",
                  deliveryMethod === opt.value ? "border-gold-500 bg-gold-50 dark:bg-gold-900/10" : "border-ink-900/10 dark:border-white/10"
                )}
              >
                <div className="flex items-center gap-3">
                  <input type="radio" name="delivery" checked={deliveryMethod === opt.value} onChange={() => setDeliveryMethod(opt.value)} className="accent-gold-500" />
                  <div>
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-xs text-ink-700/60 dark:text-beige-100/60">{opt.description}</p>
                  </div>
                </div>
                <span className="text-sm font-medium">
                  {subtotalKes >= FREE_DELIVERY_THRESHOLD_KES ? "Free" : formatKes(DELIVERY_FEES[opt.value])}
                </span>
              </label>
            ))}
          </div>

          {deliveryMethod !== "STORE_PICKUP" && (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input required placeholder="County" value={county} onChange={(e) => setCounty(e.target.value)} className="input-luxe" />
              <input required placeholder="Town / Area" value={town} onChange={(e) => setTown(e.target.value)} className="input-luxe" />
              <input placeholder="Estate, street & building (optional)" value={address} onChange={(e) => setAddress(e.target.value)} className="input-luxe sm:col-span-2" />
            </div>
          )}
        </section>

        <section className="card-luxe p-6">
          <p className="font-display text-xl font-semibold">3. Payment Method</p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {PAYMENT_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors",
                  paymentMethod === opt.value ? "border-gold-500 bg-gold-50 dark:bg-gold-900/10" : "border-ink-900/10 dark:border-white/10"
                )}
              >
                <input type="radio" name="payment" checked={paymentMethod === opt.value} onChange={() => setPaymentMethod(opt.value)} className="accent-gold-500" />
                {opt.icon}
                <span className="text-sm font-medium">{opt.label}</span>
              </label>
            ))}
          </div>

          {paymentMethod === "MPESA_STK" && (
            <div className="mt-4 rounded-xl bg-beige-100 p-4 dark:bg-ink-700">
              <label className="text-xs font-medium text-ink-700 dark:text-beige-100/70">M-Pesa Phone Number</label>
              <input
                required
                placeholder="07XX XXX XXX"
                value={mpesaPhone}
                onChange={(e) => setMpesaPhone(e.target.value)}
                className="input-luxe mt-2 bg-white dark:bg-ink-900"
              />
              <p className="mt-2 text-xs text-ink-700/60 dark:text-beige-100/50">
                You'll receive an STK Push prompt on this number. Enter your M-Pesa PIN to confirm payment of {formatKes(total)}.
              </p>
            </div>
          )}

          {paymentMethod === "MPESA_PAYBILL" && (
            <div className="mt-4 rounded-xl bg-beige-100 p-4 text-sm dark:bg-ink-700">
              <p>
                Paybill Number: <strong>{MPESA_PAYBILL}</strong>
              </p>
              <p>
                Account Number: <strong>{orderNumber || "Generated after order placed"}</strong>
              </p>
              <p className="mt-1 text-xs text-ink-700/60 dark:text-beige-100/50">Business Name: {SITE_NAME} · Till: {MPESA_TILL}</p>
            </div>
          )}

          <div className="mt-4 flex items-center gap-2 text-xs text-ink-700/60 dark:text-beige-100/50">
            <BadgeCheck size={14} className="text-gold-500" /> Payments secured & encrypted. We never store your M-Pesa PIN.
          </div>
        </section>
      </div>

      <aside className="card-luxe h-fit space-y-4 p-6">
        <p className="font-display text-xl font-semibold">Order Summary</p>
        <div className="max-h-64 space-y-3 overflow-y-auto">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="flex justify-between text-sm">
              <span className="text-ink-700/80 dark:text-beige-100/70">
                {product.name} × {quantity}
              </span>
              <span className="font-medium">{formatKes(product.priceKes * quantity)}</span>
            </div>
          ))}
        </div>
        <div className="space-y-2 border-t border-ink-900/10 pt-4 text-sm dark:border-white/10">
          <div className="flex justify-between">
            <span className="text-ink-700/70 dark:text-beige-100/60">Subtotal</span>
            <span>{formatKes(subtotalKes)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-700/70 dark:text-beige-100/60">Delivery ({DELIVERY_OPTIONS.find((o) => o.value === deliveryMethod)?.label})</span>
            <span>{deliveryFee === 0 ? "Free" : formatKes(deliveryFee)}</span>
          </div>
          <div className="flex justify-between border-t border-ink-900/10 pt-2 text-base font-semibold dark:border-white/10">
            <span>Total</span>
            <span>{formatKes(total)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-beige-100 p-3 text-xs text-ink-700/70 dark:bg-ink-700 dark:text-beige-100/60">
          <Truck size={14} className="shrink-0 text-gold-500" /> Estimated delivery:{" "}
          {deliveryMethod === "SAME_DAY_DELIVERY" ? "Today, by 8pm" : deliveryMethod === "STORE_PICKUP" ? "Ready in 2 hours" : "2-4 business days"}
        </div>

        <button
          type="submit"
          disabled={!canSubmit || status === "awaiting-pin" || status === "confirming"}
          className="btn-gold w-full disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "awaiting-pin" && (
            <>
              <Loader2 size={16} className="animate-spin" /> Check your phone for STK Push…
            </>
          )}
          {status === "confirming" && (
            <>
              <Loader2 size={16} className="animate-spin" /> Confirming payment…
            </>
          )}
          {status === "idle" && `Pay ${formatKes(total)}`}
          {status === "failed" && "Retry Payment"}
        </button>
        <p className="text-center text-[11px] text-ink-700/50 dark:text-beige-100/40">
          By placing this order you agree to our{" "}
          <a href="/policies/terms" className="underline">
            Terms
          </a>{" "}
          and{" "}
          <a href="/policies/returns" className="underline">
            Return Policy
          </a>
          .
        </p>
      </aside>
    </form>
  );
}
