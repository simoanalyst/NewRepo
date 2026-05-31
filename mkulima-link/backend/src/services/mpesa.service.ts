import axios from 'axios';
import { logger } from '../config/logger';

const MPESA_BASE_URL = process.env.MPESA_ENV === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke';

const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || '';
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || '';
const SHORTCODE = process.env.MPESA_SHORTCODE || '174379';
const PASSKEY = process.env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL || 'https://api.mkulimalink.co.ke/api/payments/mpesa/callback';
const B2C_SHORTCODE = process.env.MPESA_B2C_SHORTCODE || '';
const B2C_SECURITY_CREDENTIAL = process.env.MPESA_B2C_SECURITY_CREDENTIAL || '';
const B2C_INITIATOR = process.env.MPESA_B2C_INITIATOR || '';

let tokenCache: { token: string; expiresAt: number } | null = null;

export async function getOAuthToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  const credentials = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
  const response = await axios.get(`${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${credentials}` },
  });

  const { access_token, expires_in } = response.data;
  tokenCache = {
    token: access_token,
    expiresAt: Date.now() + (parseInt(expires_in) - 60) * 1000,
  };

  return access_token;
}

function getTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

function generatePassword(shortcode: string, passkey: string, timestamp: string): string {
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
}

export interface STKPushResult {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export async function initiateSTKPush(
  phoneNumber: string,
  amount: number,
  accountReference: string,
  transactionDesc: string
): Promise<STKPushResult> {
  const token = await getOAuthToken();
  const timestamp = getTimestamp();
  const password = generatePassword(SHORTCODE, PASSKEY, timestamp);

  const normalizedPhone = phoneNumber.startsWith('+') ? phoneNumber.slice(1) : phoneNumber;

  const response = await axios.post(
    `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
    {
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.ceil(amount),
      PartyA: normalizedPhone,
      PartyB: SHORTCODE,
      PhoneNumber: normalizedPhone,
      CallBackURL: CALLBACK_URL,
      AccountReference: accountReference,
      TransactionDesc: transactionDesc,
    },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );

  logger.info('STK Push initiated', { phoneNumber, amount, checkoutRequestId: response.data.CheckoutRequestID });
  return response.data;
}

export async function checkSTKStatus(checkoutRequestId: string): Promise<Record<string, unknown>> {
  const token = await getOAuthToken();
  const timestamp = getTimestamp();
  const password = generatePassword(SHORTCODE, PASSKEY, timestamp);

  const response = await axios.post(
    `${MPESA_BASE_URL}/mpesa/stkpushquery/v1/query`,
    {
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return response.data;
}

export interface B2CResult {
  ConversationID: string;
  OriginatorConversationID: string;
  ResponseCode: string;
  ResponseDescription: string;
}

export async function sendB2CPayment(
  phoneNumber: string,
  amount: number,
  remarks: string,
  occasionRef: string
): Promise<B2CResult> {
  const token = await getOAuthToken();
  const normalizedPhone = phoneNumber.startsWith('+') ? phoneNumber.slice(1) : phoneNumber;

  const response = await axios.post(
    `${MPESA_BASE_URL}/mpesa/b2c/v1/paymentrequest`,
    {
      InitiatorName: B2C_INITIATOR,
      SecurityCredential: B2C_SECURITY_CREDENTIAL,
      CommandID: 'BusinessPayment',
      Amount: Math.ceil(amount),
      PartyA: B2C_SHORTCODE,
      PartyB: normalizedPhone,
      Remarks: remarks,
      QueueTimeOutURL: `${process.env.MPESA_CALLBACK_URL}/b2c/timeout`,
      ResultURL: `${process.env.MPESA_CALLBACK_URL}/b2c/result`,
      Occasion: occasionRef,
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  logger.info('B2C payment initiated', { phoneNumber, amount });
  return response.data;
}

export interface C2BRegisterResult {
  ResponseCode: string;
  ResponseDescription: string;
  OriginatorCoversationID: string;
}

export async function registerC2BURL(): Promise<C2BRegisterResult> {
  const token = await getOAuthToken();

  const response = await axios.post(
    `${MPESA_BASE_URL}/mpesa/c2b/v1/registerurl`,
    {
      ShortCode: SHORTCODE,
      ResponseType: 'Completed',
      ConfirmationURL: `${process.env.MPESA_CALLBACK_URL}/c2b/confirmation`,
      ValidationURL: `${process.env.MPESA_CALLBACK_URL}/c2b/validation`,
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return response.data;
}

export function parseMpesaCallback(body: Record<string, unknown>): {
  checkoutRequestId: string;
  resultCode: number;
  resultDesc: string;
  amount?: number;
  mpesaReceiptNumber?: string;
  transactionDate?: string;
  phoneNumber?: string;
} {
  const stkCallback = (body.Body as Record<string, unknown>)?.stkCallback as Record<string, unknown>;
  const resultCode = stkCallback?.ResultCode as number;
  const resultDesc = stkCallback?.ResultDesc as string;
  const checkoutRequestId = stkCallback?.CheckoutRequestID as string;

  if (resultCode !== 0) {
    return { checkoutRequestId, resultCode, resultDesc };
  }

  const items = (stkCallback?.CallbackMetadata as Record<string, unknown>)?.Item as Array<Record<string, unknown>>;
  const find = (name: string) => items?.find((i) => i.Name === name)?.Value;

  return {
    checkoutRequestId,
    resultCode,
    resultDesc,
    amount: find('Amount') as number,
    mpesaReceiptNumber: find('MpesaReceiptNumber') as string,
    transactionDate: find('TransactionDate') as string,
    phoneNumber: find('PhoneNumber') as string,
  };
}
