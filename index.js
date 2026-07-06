require('dotenv').config();
const { google } = require('googleapis');
const axios = require('axios');

// ---------------- CONFIG ----------------

const CONFIG = {
  spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
  sheetName: 'Form Responses 1',
  pollIntervalMs: 5000,
  apiKey: process.env.TABBLY_API_KEY,
  callFrom: process.env.CALL_FROM_NUMBER,
  organizationId: '2688',
  agentId: '5240',
  apiUrl: 'https://www.tabbly.io/dashboard/agents/endpoints/trigger-call'
};

// ---------------- COLUMNS ----------------

const COLUMNS = {
  TIMESTAMP: 1,
  FULL_NAME: 2,
  PHONE_NUMBER: 3,
  EMAIL_ADDRESS: 4,
  INTERESTED_IN: 5,
  PROPERTY_TYPE_PREFERENCE: 6,
  BUDGET_RANGE: 7,
  PREFERRED_LOCATION: 8,
  PURPOSE_OF_PURCHASE: 9,
  WHEN_PLAN_TO_BUY: 10,
  PREFERRED_CONTACT_METHOD: 11,
  BEST_TIME_FOR_CALL: 12,
  PRE_APPROVED_LOAN: 13,
  FUNDING_STATUS: 14,
  ADDITIONAL_REQUIREMENTS: 15,
  CALL_STATUS: 16   // ✅ NEW COLUMN P
};

// ---------------- STATE ----------------

let sheetsClient = null;

// ---------------- INIT SHEETS ----------------

async function initializeSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  sheetsClient = google.sheets({ version: 'v4', auth });
  console.log('[INFO] Google Sheets client initialized');
}

// ---------------- PHONE FORMAT ----------------

function formatPhoneNumber(phone) {
  if (!phone) return null;

  const digits = phone.toString().replace(/\D/g, '');

  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  if (digits.length === 11 && digits.startsWith('0')) return `+91${digits.substring(1)}`;

  return `+${digits}`;
}

// ---------------- READ LEADS ----------------

async function readLeads() {
  const res = await sheetsClient.spreadsheets.values.get({
    spreadsheetId: CONFIG.spreadsheetId,
    range: `${CONFIG.sheetName}!A:P`
  });

  const rows = res.data.values || [];

  if (rows.length <= 1) return [];

  return rows.slice(1).map((row, i) => ({
    rowNumber: i + 2,
    timestamp: row[COLUMNS.TIMESTAMP - 1] || '',
    fullName: row[COLUMNS.FULL_NAME - 1] || '',
    phoneNumber: row[COLUMNS.PHONE_NUMBER - 1] || '',
    emailAddress: row[COLUMNS.EMAIL_ADDRESS - 1] || '',
    interestedIn: row[COLUMNS.INTERESTED_IN - 1] || '',
    propertyTypePreference: row[COLUMNS.PROPERTY_TYPE_PREFERENCE - 1] || '',
    budgetRange: row[COLUMNS.BUDGET_RANGE - 1] || '',
    preferredLocation: row[COLUMNS.PREFERRED_LOCATION - 1] || '',
    purposeOfPurchase: row[COLUMNS.PURPOSE_OF_PURCHASE - 1] || '',
    whenPlanToBuy: row[COLUMNS.WHEN_PLAN_TO_BUY - 1] || '',
    preferredContactMethod: row[COLUMNS.PREFERRED_CONTACT_METHOD - 1] || '',
    bestTimeForCall: row[COLUMNS.BEST_TIME_FOR_CALL - 1] || '',
    preApprovedLoan: row[COLUMNS.PRE_APPROVED_LOAN - 1] || '',
    fundingStatus: row[COLUMNS.FUNDING_STATUS - 1] || '',
    additionalRequirements: row[COLUMNS.ADDITIONAL_REQUIREMENTS - 1] || '',
    callStatus: (row[COLUMNS.CALL_STATUS - 1] || 'pending').toLowerCase()
  }));
}

// ---------------- UPDATE SHEET ----------------

async function updateSheetStatus(rowNumber, status) {
  const timestamp = new Date().toLocaleString('en-IN');

  await sheetsClient.spreadsheets.values.batchUpdate({
    spreadsheetId: CONFIG.spreadsheetId,
    requestBody: {
      valueInputOption: 'USER_ENTERED',
      data: [
        {
          range: `${CONFIG.sheetName}!G${rowNumber}`,
          values: [[timestamp]]
        },
        {
          range: `${CONFIG.sheetName}!P${rowNumber}`,
          values: [[status]]
        }
      ]
    }
  });

  console.log(`[INFO] Updated row ${rowNumber}: ${status}`);
}

// ---------------- AI CALL ----------------

async function triggerAiCall(lead) {
  const phone = formatPhoneNumber(lead.phoneNumber);

  if (!phone) return 'invalid';

  const customInstruction = `
Lead:
Name: ${lead.fullName}
Phone: ${phone}
Email: ${lead.emailAddress}
Interest: ${lead.interestedIn}
Budget: ${lead.budgetRange}
Location: ${lead.preferredLocation}
Purpose: ${lead.purposeOfPurchase}
Timeline: ${lead.whenPlanToBuy}
Loan: ${lead.preApprovedLoan}
Notes: ${lead.additionalRequirements}
`.trim();

  try {
    console.log(`[INFO] Calling ${phone}`);

    await axios.post(CONFIG.apiUrl, {
      organization_id: CONFIG.organizationId,
      use_agent_id: CONFIG.agentId,
      called_to: phone,
      call_from: CONFIG.callFrom,

      api_key: CONFIG.apiKey,
      custom_first_line: `Hi ${lead.fullName}, this is regarding your property inquiry.`,
      custom_instruction: customInstruction
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    return 'called';

  } catch (err) {
    console.error('[ERROR]', err.response?.data?.message || err.message);
    return 'failed';
  }
}

// ---------------- PROCESS LEAD ----------------

async function processLead(lead) {
  if (!lead.fullName || !lead.phoneNumber) return null;

  const status = lead.callStatus;

  if (status === 'called' || status === 'failed') {
    console.log(`[SKIP] Row ${lead.rowNumber} already processed`);
    return null;
  }

  console.log(`[PROCESS] ${lead.fullName}`);

  const result = await triggerAiCall(lead);
  await updateSheetStatus(lead.rowNumber, result);

  return result;
}

// ---------------- POLLING ----------------

async function poll() {
  console.log('\n[INFO] Polling...');

  const leads = await readLeads();

  for (const lead of leads) {
    const result = await processLead(lead);

    if (result) {
      console.log(`[INFO] Processed one lead, stopping cycle`);
      break;
    }
  }
}

// ---------------- START ----------------

async function main() {
  await initializeSheetsClient();

  console.log('[INFO] System started');

  poll();
  setInterval(poll, CONFIG.pollIntervalMs);
}

main();