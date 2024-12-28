const SHEET_ID = process.env.SHEET_ID;
const REDIS_URI = process.env.REDIS_URI || '127.0.0.1:6379';
const GOOGLE_AUTH = {
  "private_key": "",
  "client_email": "",
  SCOPES: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
  ],
};
export { SHEET_ID, REDIS_URI, GOOGLE_AUTH };
