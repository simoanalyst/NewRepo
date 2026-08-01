import type { Metadata } from "next";
import { Calendar, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { ContactForm } from "@/components/common/ContactForm";
import { buildWhatsAppLink, WHATSAPP_NUMBER } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Reach our jewelry specialists via WhatsApp, phone, email, or our contact form. Book a virtual consultation today.",
};

export default function ContactPage() {
  const consultLink = buildWhatsAppLink("Hi! I'd like to book a virtual consultation with a jewelry specialist.");

  return (
    <div className="container-luxe py-14">
      <div className="text-center">
        <h1 className="section-heading">Get in Touch</h1>
        <p className="section-subheading mx-auto">Questions about stock, customization, delivery, or jewelry care? We're here to help.</p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          <a href={buildWhatsAppLink("Hello! I have a question about a product.")} target="_blank" rel="noopener noreferrer" className="card-luxe flex items-center gap-4 p-5 hover:border-gold-400">
            <MessageCircle className="text-[#25D366]" size={24} />
            <div>
              <p className="font-medium">WhatsApp Us</p>
              <p className="text-sm text-ink-700/60 dark:text-beige-100/60">{WHATSAPP_NUMBER} · Fastest response</p>
            </div>
          </a>
          <a href={`tel:${WHATSAPP_NUMBER}`} className="card-luxe flex items-center gap-4 p-5 hover:border-gold-400">
            <Phone className="text-gold-500" size={24} />
            <div>
              <p className="font-medium">Call Us</p>
              <p className="text-sm text-ink-700/60 dark:text-beige-100/60">{WHATSAPP_NUMBER} · Mon–Sat, 9am–7pm</p>
            </div>
          </a>
          <a href="mailto:hello@kenyanjewelry.co.ke" className="card-luxe flex items-center gap-4 p-5 hover:border-gold-400">
            <Mail className="text-gold-500" size={24} />
            <div>
              <p className="font-medium">Email Us</p>
              <p className="text-sm text-ink-700/60 dark:text-beige-100/60">hello@kenyanjewelry.co.ke</p>
            </div>
          </a>
          <div id="consultation" className="card-luxe flex items-center gap-4 p-5">
            <Calendar className="text-gold-500" size={24} />
            <div className="flex-1">
              <p className="font-medium">Book a Virtual Consultation</p>
              <p className="text-sm text-ink-700/60 dark:text-beige-100/60">Video call with a jewelry specialist, from anywhere in Kenya.</p>
              <a href={consultLink} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-medium text-gold-600 hover:underline">
                Book Now →
              </a>
            </div>
          </div>
          <div className="card-luxe flex items-center gap-4 p-5">
            <MapPin className="text-gold-500" size={24} />
            <div>
              <p className="font-medium">Visit a Showroom</p>
              <p className="text-sm text-ink-700/60 dark:text-beige-100/60">The Address, 5th Floor, Muthithi Road, Westlands, Nairobi</p>
            </div>
          </div>
        </div>

        <div className="card-luxe p-6 sm:p-8">
          <p className="font-display text-xl font-semibold">Send Us a Message</p>
          <div className="mt-5">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
