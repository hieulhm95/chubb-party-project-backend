import { RegisterRequest, RegisterResponse, UpdateUserRequest } from '../types/user.types';
import { GoogleSpreadsheetRow, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import { format } from 'date-fns';
import { Redis } from 'ioredis';
import { convertBase64 } from '../utils/utils';
import { REDIS_URI } from '../configs/configs';
import { connectGoogleApis, getSheet } from '../utils/googleApis';

let redis = new Redis(REDIS_URI);

export async function get(email: string) {
  const doc = await connectGoogleApis();
  const sheet = doc.sheetsByIndex[0];
  const userRow = await getUserByEmail(email, sheet);
  if (!userRow) {
    return null;
  }
  const allCells = getAllCellsInRow(sheet, userRow);
  return allCells;
}

// async function getAllEmail(doc: any) {
//   const sheet = await getSheet(doc, 0);
//   await sheet.loadCells('A1:A'); // Load all Email in Email Column

//   const columnEmailValues = [];
//   for (let rowIndex = 1; rowIndex < sheet.rowCount; rowIndex++) {
//     const cell = sheet.getCell(rowIndex, 0); // Column Email is index 0
//     if (cell.value !== null && cell.value !== '') {
//       columnEmailValues.push(cell.value);
//     }
//   }
//   return columnEmailValues;
// }

async function getUserByEmail(email: string, sheet: GoogleSpreadsheetWorksheet) {
  const rows = await sheet.getRows();
  const userRow = rows.find(row => row.get('Email') === email);
  if (!userRow) {
    return null;
  }
  return userRow;
}

// export async function checkUserExist(email: string) {
//   const doc = await connectGoogleApis();
//   const emails = await getAllEmail(doc);
//   const foundUser = emails.includes(email);
//   return foundUser;
// }

export async function create(params: RegisterRequest): Promise<RegisterResponse | null> {
  const { firstName, lastName, email, company } = params;
  const doc = await connectGoogleApis();
  const sheet = await getSheet(doc, 0);
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

export async function update(updateData: UpdateUserRequest) {
  const { isRewarded, fullName, company, phone, title, email } = updateData;
  const normalizeEmail = email.toLowerCase().trim();
  const doc = await connectGoogleApis();
  const sheet = doc.sheetsByIndex[0];
  const userRow = await getUserByEmail(normalizeEmail, sheet);
  if (!userRow) {
    return null;
  }
  const payload = {
    IsRewarded: isRewarded,
    RewardedAt: format(new Date(), 'dd/MM/yyyy HH:mm'),
    FullName: fullName,
    Company: company,
    Phone: phone,
    UpdatedAt: format(new Date(), 'dd/MM/yyyy HH:mm'),
    Title: title,
  };
  userRow.assign(payload);
  await userRow.save();
  const allCells = getAllCellsInRow(sheet, userRow);
  const base64Email = convertBase64(normalizeEmail);
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
