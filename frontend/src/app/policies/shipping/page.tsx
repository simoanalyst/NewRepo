import type { Metadata } from "next";
import { formatKes } from "@/lib/format";
import { DELIVERY_FEES, FREE_DELIVERY_THRESHOLD_KES } from "@/lib/constants";

export const metadata: Metadata = { title: "Shipping & Delivery" };

export default function ShippingPage() {
  return (
    <div className="container-luxe max-w-3xl py-14">
      <h1 className="section-heading">Shipping & Delivery</h1>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink-700/85 dark:text-beige-100/80">
        <p>
          We deliver nationwide across all 47 counties in Kenya, in partnership with trusted local logistics providers
          including Sendy, Fargo Courier, and G4S, plus our own in-house riders for Nairobi.
        </p>

        <div className="overflow-x-auto rounded-xl2 border border-ink-900/10 dark:border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-beige-100 dark:bg-ink-700">
              <tr>
                <th className="px-4 py-3">Delivery Option</th>
                <th className="px-4 py-3">Estimated Time</th>
                <th className="px-4 py-3">Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900/10 dark:divide-white/10">
              <tr>
                <td className="px-4 py-3">Store Pickup</td>
                <td className="px-4 py-3">Ready within 2 hours</td>
                <td className="px-4 py-3">Free</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Same-Day Delivery</td>
                <td className="px-4 py-3">Nairobi & environs, order before 1pm</td>
                <td className="px-4 py-3">{formatKes(DELIVERY_FEES.SAME_DAY_DELIVERY)}</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Nationwide Delivery</td>
                <td className="px-4 py-3">2-4 business days</td>
                <td className="px-4 py-3">{formatKes(DELIVERY_FEES.NATIONWIDE_DELIVERY)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="rounded-xl2 bg-gold-50 p-4 text-gold-700 dark:bg-gold-900/10 dark:text-gold-300">
          Enjoy free delivery on all orders above {formatKes(FREE_DELIVERY_THRESHOLD_KES)}, regardless of delivery method.
        </p>

        <section>
          <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">Order Tracking</h2>
          <p className="mt-2">
            Once dispatched, you'll receive a tracking number via SMS/WhatsApp. Track your order anytime from your
            account dashboard.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">Packaging</h2>
          <p className="mt-2">All items ship in discreet, secure, branded packaging to protect your purchase and your privacy.</p>
        </section>
      </div>
    </div>
  );
}
