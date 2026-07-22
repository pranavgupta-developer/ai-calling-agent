import crypto from 'crypto';
import { config } from '../config';
import { logger } from '../logger';

/**
 * Validates a Twilio request using its X-Twilio-Signature header
 * 
 * @param twilioSignature The signature from the X-Twilio-Signature header
 * @param url The full URL of the webhook request (e.g., https://my-domain.com/webhook)
 * @param params The POST parameters of the request
 */
export function validateTwilioRequest(twilioSignature: string, url: string, params: Record<string, string>): boolean {
  if (!config.TWILIO_AUTH_TOKEN) {
    logger.warn('TWILIO_AUTH_TOKEN is not configured, skipping validation');
    return true; 
  }
  
  if (!twilioSignature) {
    return false;
  }

  // Sort keys alphabetically
  const keys = Object.keys(params).sort();
  
  // Append sorted parameters to the URL
  let data = url;
  for (const key of keys) {
    data += key + params[key];
  }
  
  // Calculate HMAC-SHA1 signature
  const expectedSignature = crypto
    .createHmac('sha1', config.TWILIO_AUTH_TOKEN)
    .update(data)
    .digest('base64');
    
  // Use timingSafeEqual to prevent timing attacks
  try {
    const a = Buffer.from(twilioSignature);
    const b = Buffer.from(expectedSignature);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch (err) {
    return false;
  }
}
