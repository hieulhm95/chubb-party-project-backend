import QRCode from 'qrcode';
import { insertLog } from './log.services';
// import fs from 'fs';

export async function generateQRCode(text: string): Promise<string> {
  try {
    const url = await QRCode.toDataURL(text);
    return url;
  } catch (err) {
    console.error('Error generating QR code', err);
    await insertLog({
      message: 'Error generating QR code',
      error: err,
      type: 'email',
      data: JSON.stringify({ text: text }),
    });
    throw err;
  }
}

// export function base64ToImage(base64String: string, filePath: string): void {
//   const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
//   const buffer = Buffer.from(base64Data, 'base64');
//   fs.writeFileSync(filePath, buffer);
// }
