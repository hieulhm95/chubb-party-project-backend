import path from 'path';
import fs from 'fs';

const credentialFolder = path.join(process.cwd(), 'credentials');

interface ConfigData {
  SHEET_ID: string;
  REDIS_URI: string;
  GOOGLE_AUTH: {
    private_key: string;
    client_email: string;
    SCOPES: string[];
  };
  MAPPING_RULES: {
    [key in string]: string;
  };
  DATABASE_URL: string;
  FPT_API_KEY: string;
}

const configData: ConfigData = {} as any;

configData.SHEET_ID = process.env.SHEET_ID || '';
configData.REDIS_URI = process.env.REDIS_URI || '127.0.0.1:6379';
configData.DATABASE_URL = process.env.DATABASE_URL as string;
configData.FPT_API_KEY = process.env.FPT_API_KEY || '';
configData.GOOGLE_AUTH = {
  private_key: '',
  client_email: '',
  SCOPES: [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/spreadsheets.readonly',
  ],
};

if (fs.existsSync(credentialFolder) && process.env.GOOGLE_CREDENTIALS_FILENAME) {
  try {
    const credentialData = JSON.parse(
      fs.readFileSync(path.join(credentialFolder, process.env.GOOGLE_CREDENTIALS_FILENAME), 'utf-8')
    );
    configData.GOOGLE_AUTH.client_email = credentialData.client_email;
    configData.GOOGLE_AUTH.private_key = credentialData.private_key;
  } catch (_) {}
}

configData.MAPPING_RULES = {};
if (process.env.MAPPING_RULES) {
  configData.MAPPING_RULES = JSON.parse(process.env.MAPPING_RULES);
}

export = configData;
