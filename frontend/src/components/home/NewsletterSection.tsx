import { NewsletterForm } from "@/components/home/NewsletterForm";

export function NewsletterSection() {
  return (
    <section className="bg-ink-900 py-16">
      <div className="container-luxe text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">Join the Inner Circle</p>
        <h2 className="mt-2 font-display text-3xl font-medium text-white sm:text-4xl">Get 10% Off Your First Order</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-beige-100/70">
          Subscribe for early access to new collections, exclusive offers, and jewelry care tips.
        </p>
        <NewsletterForm />
      </div>
    </section>
  );
}
