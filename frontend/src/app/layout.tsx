import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Premium Handcrafted Jewelry in Kenya`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Shop premium, certified jewelry handcrafted in Kenya — engagement rings, wedding bands, necklaces, earrings & watches. Pay securely with M-Pesa. Nationwide delivery.",
  keywords: [
    "jewelry Kenya",
    "engagement rings Nairobi",
    "gold jewelry Kenya",
    "M-Pesa jewelry shopping",
    "wedding rings Kenya",
    "Kenyan jewelry brand",
  ],
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Premium Handcrafted Jewelry in Kenya`,
    description: "Certified, handcrafted luxury jewelry. Pay with M-Pesa. Nationwide delivery across Kenya.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Premium Handcrafted Jewelry in Kenya`,
    description: "Certified, handcrafted luxury jewelry. Pay with M-Pesa. Nationwide delivery across Kenya.",
  },
  robots: { index: true, follow: true },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "JewelryStore",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  address: {
    "@type": "PostalAddress",
    streetAddress: "The Address, 5th Floor, Muthithi Road, Westlands",
    addressLocality: "Nairobi",
    addressCountry: "KE",
  },
  sameAs: ["https://instagram.com", "https://facebook.com", "https://tiktok.com"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className={`${display.variable} ${body.variable} font-body`}>
        <Providers>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <WhatsAppButton />
        </Providers>
      </body>
    </html>
  );
}
