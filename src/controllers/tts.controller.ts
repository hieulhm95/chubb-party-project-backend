import { NextFunction, Request, Response } from 'express';
import * as ttsServices from '../services/tts.services';
import * as qrCodeServices from '../services/qrcode.services';
import fs from 'fs';
import path from 'path';

export async function createVoice(req: Request, res: Response, next: NextFunction) {
  try {
    const message = req.body.message;
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }
    const result = await ttsServices.createVoice(message);
    res.json(result);
  } catch (err) {
    console.error(`Error while create voice`, (err as any).message);
    next(err);
  }
}

export async function createVoiceCallback(req: Request, res: Response, next: NextFunction) {
  try {
    console.log('debug', req, res);
    // const message = req.body.message;
    // if (!message) {
    //   return res.status(400).json({ message: 'Message is required' });
    // }
    // ttsServices.createVoiceCallback(message, (buffer: Buffer) => {
    //   res.send(buffer);
    // });
  } catch (err) {
    console.error(`Error while create voice callback`, (err as any).message);
    next(err);
  }
}

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
    const filePath = path.join(__dirname, '..', 'images', 'qrcode.png');
    qrCodeServices.base64ToImage(qrCodeUrl, filePath);
    res.json({ qrCodeUrl });
  } catch (err) {
    console.error('Error while creating QR code', (err as any).message);
    next(err);
  }
}
