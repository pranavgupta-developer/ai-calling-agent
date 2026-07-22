import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
// TWILIO_PHONE_REGION is optional, can be useful for regional endpoints if necessary
// const twilioRegion = process.env.TWILIO_PHONE_REGION; 

if (!accountSid || !authToken) {
  throw new Error("Missing Twilio credentials. TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required in environment variables.");
}

export const twilioClient = twilio(accountSid, authToken);
