import { RegisterRequest, RegisterResponse } from '../types/user.types';
import { mockUser } from '../utils/constant';
import { JWT } from 'google-auth-library';
import {
  GoogleSpreadsheet,
  GoogleSpreadsheetRow,
  GoogleSpreadsheetWorksheet,
} from 'google-spreadsheet';
import { format } from 'date-fns';
import { Redis } from 'ioredis';
import { convertBase64 } from '../utils/utils';
import { GOOGLE_AUTH, REDIS_URI, SHEET_ID } from '../configs/configs';

let redis = new Redis(REDIS_URI);

export async function get(email: string) {
  const doc = await connectGoogleApis();
  const sheet = doc.sheetsByIndex[0];
  const rows = await sheet.getRows();
  const userRow = rows.find(row => row.get('Email') === email);
  if (!userRow) {
    return null;
  }
  const allCells = getAllCellsInRow(sheet, userRow);
  return allCells;
}

async function connectGoogleApis() {
  const jwt = new JWT({
    email: GOOGLE_AUTH.client_email,
    key: GOOGLE_AUTH.private_key,
    scopes: GOOGLE_AUTH.SCOPES,
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

// Get all cells in the row
function getAllCellsInRow(sheet: GoogleSpreadsheetWorksheet, userRow: GoogleSpreadsheetRow) {
  const allCells: { [key: string]: any } = {};
  sheet.headerValues.forEach(header => {
    allCells[header] = userRow.get(header);
  });
  return allCells;
}

export async function update(email: string, updateData: { isRewarded: boolean }) {
  const { isRewarded } = updateData;
  const doc = await connectGoogleApis();
  const sheet = doc.sheetsByIndex[0];
  const rows = await sheet.getRows();
  const userRow = rows.find(row => row.get('Email') === email);
  if (!userRow) {
    return null;
  }
  const payload = {
    IsRewarded: isRewarded,
    RewardedAt: format(new Date(), 'dd/MM/yyyy HH:mm'),
  };
  userRow.assign(payload);
  await userRow.save();
  const allCells = getAllCellsInRow(sheet, userRow);
  const base64Email = convertBase64(email);
  const result = {
    ...allCells,
    ...payload,
  };
  await redis.set(
    base64Email,
    JSON.stringify({
      ...allCells,
      ...payload,
    })
  );
  return result;
}
