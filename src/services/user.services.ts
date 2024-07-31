import { RegisterRequest, RegisterResponse } from '../types/user.types';
import { mockUser } from '../utils/constant';
import { JWT } from 'google-auth-library';
// import creds from '../configs/gg-credential.json';
import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import { format } from 'date-fns';
import { Redis } from 'ioredis';
import { convertBase64 } from '../utils/utils';
import { REDIS_URI, SCOPES, SHEET_ID } from '../configs/configs';

let redis = new Redis(REDIS_URI);

export async function get(page = 1) {
  return mockUser;
}

export async function connectGoogleApis() {
  const jwt = new JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY,
    scopes: SCOPES,
  });
  console.log('====debug=====', process.env.GOOGLE_CLIENT_EMAIL);
  const doc = new GoogleSpreadsheet(SHEET_ID, jwt);
  await doc.loadInfo();
  return doc;
}

export async function getSheet(doc: GoogleSpreadsheet) {
  return doc.sheetsByIndex[0];
}

async function getAllEmail(doc: GoogleSpreadsheet) {
  const sheet = await getSheet(doc);
  await sheet.loadCells('C1:C'); // Load all Email in Email Column

  const columnEmailValues = [];
  for (let rowIndex = 1; rowIndex < sheet.rowCount; rowIndex++) {
    const cell = sheet.getCell(rowIndex, 2); // Column Email is index 2
    if (cell.value !== null && cell.value !== '') {
      columnEmailValues.push(cell.value);
    }
  }
  return columnEmailValues;
}

export async function checkUserExist(doc: GoogleSpreadsheet, email: string) {
  const emails = await getAllEmail(doc);
  const foundUser = emails.includes(email);
  return foundUser;
}

export async function create(
  sheet: GoogleSpreadsheetWorksheet,
  params: RegisterRequest
): Promise<RegisterResponse | null> {
  const { firstName, lastName, email, company } = params;
  await sheet.addRow({
    FirstName: firstName,
    LastName: lastName,
    Email: email,
    Company: company,
    CreatedAt: format(new Date(), 'dd/MM/yyyy HH:mm'),
    UpdatedAt: format(new Date(), 'dd/MM/yyyy HH:mm'),
  });
  const base64Email = convertBase64(email);
  await redis.set(
    base64Email,
    JSON.stringify({
      firstName,
      lastName,
      email,
      company,
    })
  );
  return {
    firstName,
    lastName,
    email,
    company,
  };
}
