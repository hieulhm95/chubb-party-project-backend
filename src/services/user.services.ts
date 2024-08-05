import { RegisterRequest, RegisterResponse, UpdateUserRequest } from '../types/user.types';
import { GoogleSpreadsheetRow, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import { format } from 'date-fns';
import { Redis } from 'ioredis';
import { convertBase64 } from '../utils/utils';
import { REDIS_URI } from '../configs/configs';
import { connectGoogleApis, getSheet } from '../utils/googleApis';
import * as giftServices from './gift.services';

let redis = new Redis(REDIS_URI);

export async function get(email: string) {
  const doc = await connectGoogleApis();
  const sheet = doc.sheetsByIndex[0];
  const userRow = await getUserByEmail(email, sheet);
  if (!userRow) {
    return null;
  }
  return getAllCellsInRow(sheet, userRow);
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
  const { firstName, lastName, email, company, device } = params;
  const doc = await connectGoogleApis();
  const sheet = await getSheet(doc, 0);
  const currentTime = format(new Date(), 'dd/MM/yyyy HH:mm');
  await sheet.addRow({
    FirstName: firstName,
    LastName: lastName,
    Email: email,
    Company: company,
    CreatedAt: currentTime,
    UpdatedAt: currentTime,
    IsRewarded: false,
    IsPlayed: false,
    Device: device ?? '',
  });
  const base64Email = convertBase64(email);
  const result = {
    firstName,
    lastName,
    email,
    company,
    isRewarded: false,
    createdAt: currentTime,
    updatedAt: currentTime,
    isPlayed: false,
    device: device ?? '',
  };
  await redis.set(base64Email, JSON.stringify(result));
  return result;
}

// Get all cells in the row
function getAllCellsInRow(sheet: GoogleSpreadsheetWorksheet, userRow: GoogleSpreadsheetRow) {
  const allCells: { [key: string]: any } = {};
  sheet.headerValues.forEach(header => {
    const camelCaseHeader = header.charAt(0).toLowerCase() + header.slice(1);
    allCells[camelCaseHeader] = userRow.get(header);
  });
  return allCells;
}

export async function update(updateData: UpdateUserRequest) {
  const { isRewarded, fullName, company, phone, title, email, isPlayed, giftId } = updateData;
  const normalizeEmail = email.toLowerCase().trim();
  const doc = await connectGoogleApis();
  const sheet = doc.sheetsByIndex[0];
  const userRow = await getUserByEmail(normalizeEmail, sheet);
  if (!userRow) {
    return null;
  }
  const currentTime = format(new Date(), 'dd/MM/yyyy HH:mm');
  const isRewardedAndGift = isRewarded && isPlayed && giftId;
  const base64Email = convertBase64(normalizeEmail);
  userRow.assign({
    IsRewarded: isRewarded,
    RewardedAt: isRewardedAndGift ? currentTime : '',
    FullName: fullName,
    Company: company,
    Phone: phone,
    UpdatedAt: currentTime,
    Title: title,
    IsPlayed: isPlayed,
    GiftId: isRewardedAndGift ? giftId : '',
  });
  await userRow.save();
  if (isRewardedAndGift) {
    await giftServices.updateGiftsStorage(Number(giftId), base64Email);
  }
  const payload = {
    isRewarded,
    fullName,
    company,
    phone,
    title,
    rewardedAt: isRewardedAndGift ? currentTime : '',
    updatedAt: currentTime,
    isPlayed,
    giftId: isRewardedAndGift ? giftId : '',
  };
  const allCells = getAllCellsInRow(sheet, userRow);
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
