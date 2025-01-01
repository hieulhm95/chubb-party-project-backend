import { Request, Response, NextFunction } from 'express';
import * as emailService from '../services/email.services';
import * as qrCodeServices from '../services/qrcode.services';
import { BASE_URL } from '../utils/constant';
import { logger } from '../utils/logger';

// Send email
export async function sendEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const { to, mediaId } = req.body;
    if (!to || !mediaId) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const landingPageUrl = `${BASE_URL}/${mediaId}`;
    const qrCode = await qrCodeServices.generateQRCode(landingPageUrl);
    if (!qrCode) {
      return res.status(500).json({ message: 'Failed to generate QR code' });
    }
    await emailService.sendEmailWithBase64Image(to, qrCode, to);
    res.json({ message: 'Email sent successfully' });
  } catch (err) {
    logger.error('Error while sending email', (err as any).message);
    next(err);
  }
}

// Create QR code
export async function createQRCode(req: Request, res: Response, next: NextFunction) {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }
    const qrCodeUrl = await qrCodeServices.generateQRCode(text);
    if (!qrCodeUrl) {
      return res.status(500).json({ message: 'Failed to generate QR code' });
    }
    res.json({ qrCodeUrl });
  } catch (err) {
    logger.error('Error while creating QR code', (err as any).message);
    next(err);
  }
}
