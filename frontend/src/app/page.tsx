import { Hero } from "@/components/home/Hero";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { ProductSection } from "@/components/home/ProductSection";
import { PromoBanner } from "@/components/home/PromoBanner";
import { BrandStory } from "@/components/home/BrandStory";
import { Testimonials } from "@/components/home/Testimonials";
import { InstagramGallery } from "@/components/home/InstagramGallery";
import { FAQSection } from "@/components/home/FAQSection";
import { StoreLocationsSection } from "@/components/home/StoreLocationsSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { bestSellers, featuredProducts, limitedEdition, newArrivals } from "@/data/products";

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryShowcase />
      <ProductSection title="Featured Collections" subtitle="Handpicked pieces our stylists love." products={featuredProducts} viewAllHref="/shop?filter=featured" />
      <PromoBanner />
      <ProductSection title="Best Sellers" subtitle="Our most-loved pieces, chosen by customers across Kenya." products={bestSellers} viewAllHref="/shop?filter=bestsellers" tone="dark" />
      <ProductSection title="New Arrivals" subtitle="Fresh designs, just landed." products={newArrivals} viewAllHref="/shop?filter=new" />
      <ProductSection title="Limited Edition" subtitle="Rare pieces, crafted in small batches. Once they're gone, they're gone." products={limitedEdition} viewAllHref="/shop?filter=limited" />
      <BrandStory />
      <Testimonials />
      <InstagramGallery />
      <StoreLocationsSection />
      <FAQSection />
      <NewsletterSection />
    </>
  );
}
