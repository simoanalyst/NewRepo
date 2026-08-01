import Link from "next/link";
import { faqs } from "@/data/faqs";
import { Accordion } from "@/components/ui/Accordion";

export function FAQSection() {
  return (
    <section className="bg-beige-50 py-14 dark:bg-ink-800 sm:py-20">
      <div className="container-luxe max-w-3xl">
        <div className="text-center">
          <h2 className="section-heading">Frequently Asked Questions</h2>
          <p className="section-subheading mx-auto">Everything you need to know about shopping with us.</p>
        </div>
        <div className="mt-8 rounded-xl2 border border-ink-900/10 bg-white px-6 dark:border-white/10 dark:bg-ink-900">
          <Accordion items={faqs} />
        </div>
        <p className="mt-6 text-center text-sm text-ink-700/70 dark:text-beige-100/60">
          Still have questions?{" "}
          <Link href="/contact" className="font-medium text-gold-600 hover:underline">
            Chat with our team
          </Link>
        </p>
      </div>
    </section>
  );
}
