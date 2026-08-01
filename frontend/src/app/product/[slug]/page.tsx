import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts, products } from "@/data/products";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductActions } from "@/components/product/ProductActions";
import { ProductTabs } from "@/components/product/ProductTabs";
import { ProductSection } from "@/components/home/ProductSection";
import { StarRating } from "@/components/ui/StarRating";
import { Badge } from "@/components/ui/Badge";
import { formatKes, percentOff } from "@/lib/format";
import { SITE_URL } from "@/lib/constants";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const product = getProductBySlug(params.slug);
  if (!product) return {};
  return {
    title: product.name,
    description: `${product.shortDescription} Buy online in Kenya for ${formatKes(product.priceKes)}. Pay with M-Pesa.`,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: [{ url: product.images[0]?.url }],
    },
  };
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  if (!product) notFound();

  const related = getRelatedProducts(product);
  const discount = percentOff(product.priceKes, product.compareAtPriceKes);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.map((i) => i.url),
    description: product.description,
    sku: product.sku,
    brand: { "@type": "Brand", name: "Kenyan Jewelry Co." },
    aggregateRating: product.reviewCount
      ? { "@type": "AggregateRating", ratingValue: product.avgRating.toFixed(1), reviewCount: product.reviewCount }
      : undefined,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/product/${product.slug}`,
      priceCurrency: "KES",
      price: product.priceKes,
      availability: product.isAvailable ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="container-luxe py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="mb-6 text-xs text-ink-700/60 dark:text-beige-100/50">
        <span>Shop</span> / <span>{product.categoryName}</span> / <span className="text-ink-900 dark:text-white">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />

        <div>
          <div className="flex flex-wrap gap-2">
            {product.isNewArrival && <Badge variant="dark">New Arrival</Badge>}
            {product.isBestSeller && <Badge variant="gold">Best Seller</Badge>}
            {product.isLimitedEdition && <Badge variant="danger">Limited Edition</Badge>}
          </div>

          <h1 className="mt-3 font-display text-3xl font-medium sm:text-4xl">{product.name}</h1>
          <div className="mt-2 flex items-center gap-3">
            <StarRating rating={product.avgRating} showValue />
            <span className="text-xs text-ink-700/60 dark:text-beige-100/60">{product.reviewCount} reviews</span>
            <span className="text-xs text-ink-700/60 dark:text-beige-100/60">· SKU {product.sku}</span>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-display text-3xl font-semibold text-gold-600">{formatKes(product.priceKes)}</span>
            {product.compareAtPriceKes && (
              <span className="text-lg text-ink-500/60 line-through dark:text-beige-100/40">{formatKes(product.compareAtPriceKes)}</span>
            )}
            {discount && <Badge variant="danger">Save {discount}%</Badge>}
          </div>

          <p className="mt-4 text-sm leading-relaxed text-ink-700/80 dark:text-beige-100/70">{product.shortDescription}</p>

          <div className="mt-6 border-t border-ink-900/10 pt-6 dark:border-white/10">
            <ProductActions product={product} />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-ink-900/10 pt-6 text-xs text-ink-700/70 dark:border-white/10 dark:text-beige-100/60">
            <p>✓ {product.warrantyMonths}-month warranty</p>
            <p>✓ Authenticity guarantee</p>
            <p>✓ Free delivery above KES 15,000</p>
            <p>✓ 7-day returns & exchanges</p>
          </div>
        </div>
      </div>

      <ProductTabs product={product} />

      {related.length > 0 && (
        <div className="mt-10 border-t border-ink-900/10 dark:border-white/10">
          <ProductSection title="You May Also Like" products={related} viewAllHref={`/shop/${product.categorySlug}`} />
        </div>
      )}
    </div>
  );
}
