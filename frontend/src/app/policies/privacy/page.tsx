import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPolicyPage() {
  return (
    <div className="container-luxe max-w-3xl py-14">
      <h1 className="section-heading">Privacy Policy</h1>
      <p className="mt-2 text-xs text-ink-700/50 dark:text-beige-100/40">Last updated: January 2026</p>

      <div className="prose-luxe mt-8 space-y-6 text-sm leading-relaxed text-ink-700/85 dark:text-beige-100/80">
        <p>
          {SITE_NAME} ("we", "us") is committed to protecting your privacy in compliance with Kenya's Data Protection
          Act, 2019. This policy explains what personal data we collect, why, and how we protect it.
        </p>

        <section>
          <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">1. Information We Collect</h2>
          <p className="mt-2">
            We collect information you provide directly — name, phone number, email, delivery address — and
            transaction data including order history and M-Pesa payment confirmations (we never store your M-Pesa PIN).
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">2. How We Use Your Data</h2>
          <p className="mt-2">
            To process orders and payments, deliver purchases, send order updates via SMS/WhatsApp, provide customer
            support, and — with your consent — send marketing communications you can opt out of at any time.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">3. Data Sharing</h2>
          <p className="mt-2">
            We share data only with trusted processors necessary to fulfil your order: Safaricom (M-Pesa), logistics
            partners (e.g. Sendy, Fargo Courier), and payment processors. We never sell your personal data.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">4. Data Security</h2>
          <p className="mt-2">
            All data is transmitted over HTTPS, passwords are hashed, and access to customer data is restricted by
            role-based permissions with full audit logging.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">5. Your Rights</h2>
          <p className="mt-2">
            You may request access to, correction of, or deletion of your personal data at any time by contacting{" "}
            <a href="mailto:privacy@kenyanjewelry.co.ke" className="text-gold-600 underline">
              privacy@kenyanjewelry.co.ke
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
