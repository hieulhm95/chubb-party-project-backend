import { NextFunction, Request, Response } from 'express';
import * as ttsServices from '../services/tts.services';
import * as qrCodeServices from '../services/qrcode.services';

export async function createVoice(req: Request, res: Response, next: NextFunction) {
  try {
    const { message, mediaId, gender } = req.body;
    if (!message || !mediaId) {
      return res.status(400).json({ message: 'Message is required' });
    }
    const result = await ttsServices.createVoice(message, mediaId, gender);
    res.json(result);
  } catch (err) {
    console.error(`Error while create voice`, (err as any).message);
    next(err);
  }
}

export async function createVoiceCallback(req: Request, res: Response, next: NextFunction) {
  try {
    const mediaId = req.query.mediaId as string;
    if (!mediaId) {
      return res.status(400).json({ message: 'Media ID is required' });
    }
    console.log('debug callback', mediaId, 'req', req, 'res', res);
    res.json({ success: true, mediaId });

    // const result = await ttsServices.createVoiceCallback(mediaId);
    // if (!result || !result?.success) {
    //   return res.status(500).json({ message: 'Failed to create voice callback' });
    // }

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
