import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Product } from "@/types";
import { ProductCard } from "@/components/product/ProductCard";

export function ProductSection({
  title,
  subtitle,
  products,
  viewAllHref,
  tone = "light",
}: {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllHref: string;
  tone?: "light" | "dark";
}) {
  if (products.length === 0) return null;

  return (
    <section className={tone === "dark" ? "bg-ink-900 py-14 sm:py-20" : "py-14 sm:py-20"}>
      <div className="container-luxe">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className={tone === "dark" ? "section-heading text-white" : "section-heading"}>{title}</h2>
            {subtitle && <p className={tone === "dark" ? "section-subheading text-beige-100/70" : "section-subheading"}>{subtitle}</p>}
          </div>
          <Link
            href={viewAllHref}
            className={
              tone === "dark"
                ? "flex items-center gap-1.5 text-sm font-medium text-gold-300 hover:text-gold-200"
                : "flex items-center gap-1.5 text-sm font-medium text-gold-600 hover:text-gold-700"
            }
          >
            View All <ArrowRight size={15} />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products.slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
