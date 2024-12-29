import { Request, Response, NextFunction } from 'express';
import * as emailService from '../services/email.services';
// import { sendEmailWithBase64Image } from './path/to/your/emailService';

export async function sendEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const { to, subject, image } = req.body;
    if (!to || !subject || !image) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    await emailService.sendEmailWithBase64Image(to, subject, image);
    res.json({ message: 'Email sent successfully' });
  } catch (err) {
    console.error('Error while sending email', (err as any).message);
    next(err);
  }
}
