import { RegisterRequest, RegisterResponse } from '../types/user.types';
import { mockUser } from '../utils/constant';
import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { format } from 'date-fns';
import { Redis } from 'ioredis';
import { convertBase64 } from '../utils/utils';
import { REDIS_URI, SCOPES, SHEET_ID } from '../configs/configs';
import creds from '../configs/gg-cred.json';

let redis = new Redis(REDIS_URI);

export async function get(page = 1) {
  return mockUser;
}

async function connectGoogleApis() {
  const jwt = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: SCOPES,
  });
  const doc = new GoogleSpreadsheet(SHEET_ID, jwt);
  await doc.loadInfo();
  return doc;
}

const getSheet = async (doc: any) => {
  return doc.sheetsByIndex[0];
};

async function getAllEmail(doc: any) {
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

export async function checkUserExist(email: string) {
  const doc = await connectGoogleApis();
  const emails = await getAllEmail(doc);
  const foundUser = emails.includes(email);
  return foundUser;
}

export async function create(params: RegisterRequest): Promise<RegisterResponse | null> {
  const { firstName, lastName, email, company } = params;
  const doc = await connectGoogleApis();
  const sheet = await getSheet(doc);
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
