import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

export async function generateQRCode(text: string): Promise<string> {
  try {
    const url = await QRCode.toDataURL(text);
    return url;
  } catch (err) {
    console.error('Error generating QR code', err);
    throw err;
  }
}

export function base64ToImage(base64String: string, filePath: string): void {
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  fs.writeFileSync(filePath, buffer);
}
