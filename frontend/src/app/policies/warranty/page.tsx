import type { Metadata } from "next";

export const metadata: Metadata = { title: "Warranty" };

export default function WarrantyPage() {
  return (
    <div className="container-luxe max-w-3xl py-14">
      <h1 className="section-heading">Warranty & Authenticity Guarantee</h1>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink-700/85 dark:text-beige-100/80">
        <section>
          <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">12-Month Manufacturing Warranty</h2>
          <p className="mt-2">
            Every piece includes a 12-month warranty against manufacturing defects, covering clasp failures, stone
            setting issues, and plating defects under normal wear.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">What's Not Covered</h2>
          <p className="mt-2">
            Normal wear and tear, damage from accidents, improper storage, or exposure to chemicals (perfume,
            chlorine, lotion) is not covered.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">Authenticity Guarantee</h2>
          <p className="mt-2">
            We guarantee that every product's stated material (e.g. 18k Gold, Platinum) and gemstone (e.g. natural
            Diamond, Emerald, Ruby) is accurate as described. Certified stones ship with independent GIA/IGI
            documentation.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">Making a Warranty Claim</h2>
          <p className="mt-2">
            Contact us on WhatsApp with your order number, photos of the issue, and a description. Approved claims are
            repaired or replaced free of charge.
          </p>
        </section>
      </div>
    </div>
  );
}
