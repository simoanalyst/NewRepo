import axios from "axios";
import { env } from "@/config/env";
import { logger } from "@/utils/logger";

/**
 * Sends a transactional WhatsApp message (e.g. order confirmation) via the
 * WhatsApp Business Cloud API. No-ops silently if credentials are unset,
 * since WhatsApp contact is also available via the storefront's click-to-chat button.
 */
export async function sendWhatsAppMessage(toMsisdn: string, message: string): Promise<void> {
  if (!env.whatsapp.phoneNumberId || !env.whatsapp.accessToken) {
    logger.debug("WhatsApp not configured, skipping message send", { toMsisdn });
    return;
  }

  try {
    await axios.post(
      `https://graph.facebook.com/v19.0/${env.whatsapp.phoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        to: toMsisdn,
        type: "text",
        text: { body: message },
      },
      { headers: { Authorization: `Bearer ${env.whatsapp.accessToken}` } }
    );
  } catch (err) {
    logger.error("Failed to send WhatsApp message", {
      error: axios.isAxiosError(err) ? err.response?.data : err,
    });
  }
}

export function buildWhatsAppClickToChatUrl(prefilledMessage: string): string {
  const number = env.whatsapp.businessNumber.replace(/\D/g, "");
  return `https://wa.me/${number}?text=${encodeURIComponent(prefilledMessage)}`;
}
