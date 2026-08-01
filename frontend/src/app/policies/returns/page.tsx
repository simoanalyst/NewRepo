import type { Metadata } from "next";

export const metadata: Metadata = { title: "Returns & Exchanges" };

export default function ReturnsPage() {
  return (
    <div className="container-luxe max-w-3xl py-14">
      <h1 className="section-heading">Returns & Exchanges</h1>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink-700/85 dark:text-beige-100/80">
        <section>
          <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">7-Day Return Window</h2>
          <p className="mt-2">
            Unworn items in their original, undamaged packaging with all tags and certificates attached may be
            returned within 7 days of delivery for a full refund or exchange.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">Non-Returnable Items</h2>
          <p className="mt-2">
            Personalized and engraved items are final sale unless received defective. Earrings cannot be returned for
            hygiene reasons unless faulty.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">How to Initiate a Return</h2>
          <p className="mt-2">
            Message us on WhatsApp with your order number and reason for return. We'll arrange free pickup within
            Nairobi, or provide a prepaid return label for other counties.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">Refunds</h2>
          <p className="mt-2">
            Approved refunds are processed to your original M-Pesa number or card within 5-7 business days of us
            receiving the returned item.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">Free Resizing</h2>
          <p className="mt-2">Rings include one free resize within 60 days of purchase, subject to a maximum size adjustment of two sizes.</p>
        </section>
      </div>
    </div>
  );
}
