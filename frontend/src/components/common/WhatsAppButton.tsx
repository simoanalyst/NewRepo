"use client";

import { MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/constants";

export function WhatsAppButton() {
  const href = buildWhatsAppLink("Hello! I'd like to ask about a jewelry piece I saw on your website.");
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3.5 text-white shadow-luxe transition-transform hover:scale-105 active:scale-95 sm:bottom-6 sm:right-6"
    >
      <MessageCircle size={22} fill="white" className="text-[#25D366]" />
      <span className="hidden max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-300 group-hover:max-w-xs sm:inline-block">
        Chat with us
      </span>
    </a>
  );
}
