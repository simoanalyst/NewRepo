import type { Metadata } from "next";
import Image from "next/image";
import { BUSINESS_REG_NUMBER, SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About Us",
  description: `Learn the story behind ${SITE_NAME} — handcrafted, certified jewelry designed and assembled in Nairobi, Kenya.`,
};

export default function AboutPage() {
  return (
    <div className="container-luxe py-14">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">Our Story</p>
        <h1 className="section-heading mt-2">Crafted in Kenya, Worn With Pride</h1>
        <p className="section-subheading mx-auto">
          {SITE_NAME} was founded in 2013 in Nairobi with a single mission: to make certified, world-class jewelry
          accessible to every Kenyan milestone — engagements, weddings, graduations, and everyday celebrations of self.
        </p>
      </div>

      <div className="relative mx-auto mt-10 aspect-video max-w-4xl overflow-hidden rounded-xl2 shadow-luxe">
        <Image src="https://placehold.co/1600x900/f5efe6/1a1a1a?text=Our+Craftsmanship" alt="Our workshop" fill className="object-cover" />
      </div>

      <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3">
        {[
          { title: "Ethically Sourced", body: "Every gemstone and precious metal is sourced through verified, conflict-free suppliers." },
          { title: "Locally Handcrafted", body: "Our goldsmiths and gemologists work from our Nairobi workshop, blending tradition with modern design." },
          { title: "Certified Quality", body: "Diamonds above 0.3ct ship with GIA/IGI certification and our Authenticity Guarantee." },
        ].map((item) => (
          <div key={item.title} className="card-luxe p-6 text-center">
            <p className="font-display text-lg font-semibold text-gold-600">{item.title}</p>
            <p className="mt-2 text-sm text-ink-700/75 dark:text-beige-100/70">{item.body}</p>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-12 max-w-3xl rounded-xl2 border border-ink-900/10 bg-beige-50 p-6 text-sm text-ink-700/80 dark:border-white/10 dark:bg-ink-800 dark:text-beige-100/70">
        <p className="font-semibold text-ink-900 dark:text-white">Business Information</p>
        <p className="mt-2">
          {SITE_NAME} is a registered business in the Republic of Kenya, Business Registration No. {BUSINESS_REG_NUMBER}. Our
          flagship showroom is located at The Address, 5th Floor, Muthithi Road, Westlands, Nairobi.
        </p>
      </div>
    </div>
  );
}
