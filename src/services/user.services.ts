import {
  RegisterRequest,
  RegisterResponse,
  UpdateRewardRequest,
  UpdateUserRequest,
} from '../types/user.types';
import { GoogleSpreadsheetRow, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import { format } from 'date-fns';
import { convertBase64, getFromRedisCache, saveToRedisCache } from '../utils/utils';
import {
  addRow,
  getAllCellsInRow,
  getRowByEmail,
  getSheet,
  updateSheet,
} from '../utils/googleApis';
import * as giftServices from './gift.services';

export async function get(email: string) {
  const sheet = await getSheet(0);
  const userRow = await getRowByEmail(email, sheet);
  if (!userRow) {
    return null;
  }
  return getAllCellsInRow(sheet, userRow);
}

export async function create(params: RegisterRequest): Promise<RegisterResponse | null> {
  const { firstName, lastName, email, company, device } = params;
  const sheet = await getSheet(0);
  const currentTime = format(new Date(), 'dd/MM/yyyy HH:mm');
  await addRow(sheet, {
    FirstName: firstName,
    LastName: lastName,
    Email: email,
    Company: company,
    IsRewarded: false,
    IsPlayed: false,
    Device: device ?? '',
  });
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
  await saveToRedisCache(convertBase64(email), result);
  return result;
}

async function getUserData(
  email: string,
  sheet: GoogleSpreadsheetWorksheet,
  userRow: GoogleSpreadsheetRow
) {
  const cachedData = await getFromRedisCache(email);
  if (cachedData) {
    return cachedData;
  }
  return getAllCellsInRow(sheet, userRow);
}

export async function updateReward(updateRewardData: UpdateRewardRequest) {
  const { fullName, company, phone, title, email, address } = updateRewardData;
  const normalizeEmail = email.toLowerCase().trim();
  const sheet = await getSheet(0);
  const row = await getRowByEmail(normalizeEmail, sheet);
  if (!row) {
    return null;
  }
  const userData = await getUserData(normalizeEmail, sheet, row);
  if (!userData.isRewarded) {
    return userData;
  }
  await updateSheet(sheet, normalizeEmail, {
    FullName: fullName,
    Company: company,
    Phone: phone,
    Title: title,
    Address: address,
  });
  const result = {
    ...userData,
    fullName,
    company,
    phone,
    title,
    updatedAt: format(new Date(), 'dd/MM/yyyy HH:mm'),
    address,
  };
  await saveToRedisCache(convertBase64(normalizeEmail), result);
  return result;
}

export async function update(updateData: UpdateUserRequest) {
  const { isRewarded, email, isPlayed, giftId } = updateData;
  const normalizeEmail = email.toLowerCase().trim();
  const sheet = await getSheet(0);
  const row = await getRowByEmail(normalizeEmail, sheet);
  if (!row) {
    return null;
  }
  const currentTime = format(new Date(), 'dd/MM/yyyy HH:mm');
  const isRewardedAndGift = isRewarded && isPlayed && giftId;
  const base64Email = convertBase64(normalizeEmail);
  await updateSheet(sheet, normalizeEmail, {
    IsRewarded: isRewarded,
    RewardedAt: isRewardedAndGift ? currentTime : '',
    IsPlayed: isPlayed,
    GiftId: isRewardedAndGift ? giftId : '',
  });
  if (isRewardedAndGift) {
    await giftServices.updateGiftsStorage(Number(giftId), base64Email);
  }
  const payload = {
    isRewarded,
    rewardedAt: isRewardedAndGift ? currentTime : '',
    updatedAt: currentTime,
    isPlayed,
    giftId: isRewardedAndGift ? giftId : '',
  };
  const allCells = getAllCellsInRow(sheet, row);
  const result = {
    ...allCells,
    ...payload,
  };
  await saveToRedisCache(base64Email, result);
  return result;
}
