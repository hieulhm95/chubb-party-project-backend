import { NextFunction, Request, Response } from 'express';
import * as ttsServices from '../services/tts.services';

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
    const { message, requestid, success } = req.body;
    if (!mediaId || !success || success === 'false') {
      return res.status(400).json({ message: 'Error while get voice callback' });
    }
    console.log('Debug Voice Callback', { success, mediaId, requestid, message });
    res.json({ success, mediaId, requestid, message });
  } catch (err) {
    console.error(`Error while create voice callback`, (err as any).message);
    next(err);
  }
}
