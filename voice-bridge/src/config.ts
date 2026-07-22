import dotenv from 'dotenv';

dotenv.config();

export interface AppConfig {
  PORT: number;
  HOST: string;
  LOG_LEVEL: string;
  TWILIO_AUTH_TOKEN: string;
  BASE_URL: string;
}

export const config: AppConfig = {
  PORT: parseInt(process.env.PORT || '8080', 10),
  HOST: process.env.HOST || '0.0.0.0',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
  BASE_URL: process.env.BASE_URL || ''
};

// Fail fast if missing critical environment variables
const missing = [];
if (!config.TWILIO_AUTH_TOKEN) missing.push('TWILIO_AUTH_TOKEN');
if (!config.BASE_URL) missing.push('BASE_URL');

if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}
