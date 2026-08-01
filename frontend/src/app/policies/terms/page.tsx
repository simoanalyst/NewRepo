import type { Metadata } from "next";
import { BUSINESS_REG_NUMBER, SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <div className="container-luxe max-w-3xl py-14">
      <h1 className="section-heading">Terms & Conditions</h1>
      <p className="mt-2 text-xs text-ink-700/50 dark:text-beige-100/40">Last updated: January 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink-700/85 dark:text-beige-100/80">
        <p>
          These Terms govern your use of the {SITE_NAME} website and purchase of products from us
          (Business Reg. No. {BUSINESS_REG_NUMBER}), a company registered in Kenya. By placing an order, you agree to
          these terms.
        </p>
        <section>
          <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">1. Pricing & Availability</h2>
          <p className="mt-2">All prices are listed in Kenyan Shillings (KES) and include applicable VAT. Prices and stock availability are subject to change without notice.</p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">2. Orders & Payment</h2>
          <p className="mt-2">Orders are confirmed upon successful payment via M-Pesa, Airtel Money, card, bank transfer, or cash on delivery where available. We reserve the right to cancel orders in cases of pricing errors or suspected fraud.</p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">3. Product Authenticity</h2>
          <p className="mt-2">All materials and gemstones are as described on the product page. Certified diamonds ship with GIA/IGI documentation where applicable.</p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">4. Limitation of Liability</h2>
          <p className="mt-2">We are not liable for indirect or consequential damages arising from the use of our products, beyond the purchase price paid.</p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">5. Governing Law</h2>
          <p className="mt-2">These terms are governed by the laws of the Republic of Kenya, and any disputes shall be subject to the exclusive jurisdiction of Kenyan courts.</p>
        </section>
      </div>
    </div>
  );
}
