import AfricasTalking from 'africastalking';
import { logger } from '../config/logger';

let smsClient: ReturnType<typeof AfricasTalking> | null = null;

function getSmsClient() {
  if (!smsClient) {
    const apiKey = process.env.AT_API_KEY || '';
    const username = process.env.AT_USERNAME || 'sandbox';
    if (!apiKey) {
      logger.warn('Africa\'s Talking API key not configured. SMS will be logged only.');
      return null;
    }
    smsClient = AfricasTalking({ apiKey, username });
  }
  return smsClient;
}

export async function sendSms(to: string, message: string): Promise<boolean> {
  try {
    const client = getSmsClient();
    if (!client) {
      logger.info(`[SMS MOCK] To: ${to} | Message: ${message}`);
      return true;
    }

    const sms = client.SMS;
    const result = await sms.send({
      to: [to],
      message,
      from: process.env.AT_SENDER_ID || 'MkulimaLink',
    });

    logger.info('SMS sent', { to, messageId: result.SMSMessageData?.Recipients?.[0]?.messageId });
    return true;
  } catch (err) {
    logger.error('SMS send error', { to, err });
    return false;
  }
}

export async function sendBulkSms(recipients: string[], message: string): Promise<boolean> {
  try {
    const client = getSmsClient();
    if (!client) {
      logger.info(`[SMS MOCK BULK] To: ${recipients.join(',')} | Message: ${message}`);
      return true;
    }

    const sms = client.SMS;
    await sms.send({
      to: recipients,
      message,
      from: process.env.AT_SENDER_ID || 'MkulimaLink',
    });
    return true;
  } catch (err) {
    logger.error('Bulk SMS error', err);
    return false;
  }
}
