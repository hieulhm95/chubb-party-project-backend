import { JWT } from 'google-auth-library';
import { GOOGLE_AUTH, SHEET_ID } from '../configs/configs';
import { GoogleSpreadsheet } from 'google-spreadsheet';

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

export async function getSheet(doc: GoogleSpreadsheet, index = 0) {
  return doc.sheetsByIndex[index];
}
