import { JWT } from 'google-auth-library';
import { SHEET_ID } from '../configs/configs';
import https from "https";
import {
  GoogleSpreadsheet,
  GoogleSpreadsheetRow,
  GoogleSpreadsheetWorksheet,
} from 'google-spreadsheet';
import {
  google
} from "googleapis";
import { format } from 'date-fns';
import { GOOGLE_AUTH } from '../configs/configs';
import { formatValue } from './utils';
import { logger } from './logger';

export async function getFile(fileId: string) {
  const jwt = new JWT({
    email: GOOGLE_AUTH.client_email,
    key: GOOGLE_AUTH.private_key,
    scopes: GOOGLE_AUTH.SCOPES,
  });
  const drive = google.drive({
    version: 'v3',
    auth: jwt
  });

  const [fileMeta, fileContent] = await Promise.all([
    drive.files.get({fileId: fileId, fields: "mimeType"}), 
    drive.files.get({fileId: fileId, alt: "media"} , {responseType: "stream"})
  ])

  return {
    ...fileMeta.data,
    content: fileContent.data
  }
}

export async function getFileMimeType(fileId: string) {
  const jwt = new JWT({
    email: GOOGLE_AUTH.client_email,
    key: GOOGLE_AUTH.private_key,
    scopes: GOOGLE_AUTH.SCOPES,
  });
  const drive = google.drive({
    version: 'v3',
    auth: jwt
  });

  const fileMeta = await drive.files.get({fileId: fileId, fields: "mimeType"});
  logger.info(fileMeta.data);
  return fileMeta.data.mimeType;
}

export async function connectGoogleApis() {
  const jwt = new JWT({
    email: GOOGLE_AUTH.client_email,
    key: GOOGLE_AUTH.private_key,
    scopes: GOOGLE_AUTH.SCOPES,
  });
  const doc = new GoogleSpreadsheet(SHEET_ID, jwt);
  await doc.loadInfo();
  return doc;
}

export async function getSheet(index = 0) {
  const doc = await connectGoogleApis();
  return doc.sheetsByIndex[index];
}

export async function updateSheet(sheet: GoogleSpreadsheetWorksheet, email: string, data: any) {
  const userRow = await getRowByEmail(email, sheet);
  if (!userRow) {
    return null;
  }
  const currentTime = format(new Date(), 'dd/MM/yyyy HH:mm');
  data.UpdatedAt = currentTime;
  userRow.assign(data);
  await userRow.save();
}

export async function getRowByEmail(email: string, sheet: GoogleSpreadsheetWorksheet) {
  const rows = await sheet.getRows();
  const userRow = rows.find(row => row.get('Email') === email);
  if (!userRow) {
    return null;
  }
  return userRow;
}

// Get all cells in the row
export async function getAllCellsInRow(
  sheet: GoogleSpreadsheetWorksheet,
  userRow: GoogleSpreadsheetRow
) {
  const allCells: { [key: string]: any } = {};
  sheet.headerValues.forEach(header => {
    const camelCaseHeader = header.charAt(0).toLowerCase() + header.slice(1);
    allCells[camelCaseHeader] = formatValue(header, userRow.get(header));
  });
  return allCells;
}

export async function addRow(sheet: GoogleSpreadsheetWorksheet, data: any) {
  const currentTime = format(new Date(), 'dd/MM/yyyy HH:mm');
  data.CreatedAt = currentTime;
  data.UpdatedAt = currentTime;
  await sheet.addRow(data);
}

export async function getAllRowsWithCells(sheetIndex: number) {
  const sheet = await getSheet(sheetIndex);
  const rows = await sheet.getRows();
  const allRowsWithCells = rows.map(row => getAllCellsInRow(sheet, row));
  return Promise.all(allRowsWithCells);
}

// export async function checkUserExist(email: string) {
//   const doc = await connectGoogleApis();
//   const emails = await getAllEmail(doc);
//   const foundUser = emails.includes(email);
//   return foundUser;
// }

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
