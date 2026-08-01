import type { Metadata } from "next";
import { faqs } from "@/data/faqs";
import { Accordion } from "@/components/ui/Accordion";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Answers about M-Pesa payments, delivery, returns, ring sizing, and jewelry care.",
};

export default function FaqPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <div className="container-luxe max-w-3xl py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <h1 className="section-heading text-center">Frequently Asked Questions</h1>
      <div id="size-guide" className="mt-8 rounded-xl2 border border-ink-900/10 bg-white px-6 dark:border-white/10 dark:bg-ink-900">
        <Accordion items={faqs} />
      </div>
    </div>
  );
}
