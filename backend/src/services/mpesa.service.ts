import axios from "axios";
import { env } from "@/config/env";
import { AppError } from "@/utils/AppError";
import { logger } from "@/utils/logger";

const BASE_URL =
  env.mpesa.env === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";

let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Daraja OAuth tokens are valid for ~1hr; we cache to avoid hitting the
 * token endpoint on every STK push.
 */
async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const credentials = Buffer.from(`${env.mpesa.consumerKey}:${env.mpesa.consumerSecret}`).toString("base64");

  const { data } = await axios.get(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${credentials}` },
  });

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (Number(data.expires_in ?? 3599) - 60) * 1000,
  };
  return cachedToken.token;
}

function timestampNow(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    d.getFullYear().toString() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}

function generatePassword(timestamp: string): string {
  return Buffer.from(`${env.mpesa.shortcode}${env.mpesa.passkey}${timestamp}`).toString("base64");
}

/** Normalizes 07XXXXXXXX / +2547XXXXXXXX / 2547XXXXXXXX into 2547XXXXXXXX */
export function normalizeMsisdn(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("254") && digits.length === 12) return digits;
  if (digits.startsWith("0") && digits.length === 10) return `254${digits.slice(1)}`;
  if (digits.startsWith("7") && digits.length === 9) return `254${digits}`;
  throw new AppError(400, "Invalid Kenyan phone number for M-Pesa payment");
}

export interface StkPushParams {
  phone: string;
  amountKes: number;
  orderNumber: string;
  description?: string;
}

export interface StkPushResult {
  merchantRequestId: string;
  checkoutRequestId: string;
  responseDescription: string;
}

export async function initiateStkPush(params: StkPushParams): Promise<StkPushResult> {
  if (!env.mpesa.consumerKey || !env.mpesa.consumerSecret || !env.mpesa.passkey) {
    throw new AppError(500, "M-Pesa credentials are not configured on the server");
  }

  const msisdn = normalizeMsisdn(params.phone);
  const timestamp = timestampNow();
  const password = generatePassword(timestamp);
  const token = await getAccessToken();

  try {
    const { data } = await axios.post(
      `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: env.mpesa.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.round(params.amountKes),
        PartyA: msisdn,
        PartyB: env.mpesa.shortcode,
        PhoneNumber: msisdn,
        CallBackURL: env.mpesa.callbackUrl,
        AccountReference: params.orderNumber || env.mpesa.accountReference,
        TransactionDesc: params.description ?? env.mpesa.transactionDesc,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return {
      merchantRequestId: data.MerchantRequestID,
      checkoutRequestId: data.CheckoutRequestID,
      responseDescription: data.ResponseDescription,
    };
  } catch (err) {
    logger.error("M-Pesa STK push failed", { error: axios.isAxiosError(err) ? err.response?.data : err });
    throw new AppError(502, "Failed to initiate M-Pesa payment. Please try again.");
  }
}

export async function queryStkPushStatus(checkoutRequestId: string) {
  const timestamp = timestampNow();
  const password = generatePassword(timestamp);
  const token = await getAccessToken();

  const { data } = await axios.post(
    `${BASE_URL}/mpesa/stkpushquery/v1/query`,
    {
      BusinessShortCode: env.mpesa.shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return data;
}

/** Shape of the callback Safaricom posts to MPESA_CALLBACK_URL */
export interface MpesaCallbackBody {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{ Name: string; Value?: string | number }>;
      };
    };
  };
}

export function parseCallbackMetadata(body: MpesaCallbackBody) {
  const cb = body.Body.stkCallback;
  const items = cb.CallbackMetadata?.Item ?? [];
  const find = (name: string) => items.find((i) => i.Name === name)?.Value;

  return {
    merchantRequestId: cb.MerchantRequestID,
    checkoutRequestId: cb.CheckoutRequestID,
    resultCode: cb.ResultCode,
    resultDesc: cb.ResultDesc,
    success: cb.ResultCode === 0,
    amount: find("Amount") as number | undefined,
    mpesaReceiptNumber: find("MpesaReceiptNumber") as string | undefined,
    transactionDate: find("TransactionDate") as number | undefined,
    phoneNumber: find("PhoneNumber") as string | undefined,
  };
}
