import { NextFunction, Request, Response } from 'express';
import * as ttsServices from '../services/tts.services';
import { logger } from '../utils/logger';

export async function createVoice(req: Request, res: Response, next: NextFunction) {
  try {
    const { message, mediaId, gender } = req.body;
    if (!message || !mediaId) {
      return res.status(400).json({ message: 'Message is required' });
    }
    const result = await ttsServices.createVoice(message, mediaId, gender);
    res.json(result);
  } catch (err) {
    logger.error(`Error while create voice`, (err as any).message);
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
    logger.info('Debug Voice Callback', { success, mediaId, requestid, message });
    const result = ttsServices.createVoiceCallback(mediaId, message);
    res.json({ success, requestid, ...result });
  } catch (err) {
    logger.error(`Error while create voice callback`, (err as any).message);
    next(err);
  }
}

export async function createVoiceByEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const { emails } = req.body;
    if (!emails) {
      return res.status(400).json({ message: 'Emails is required' });
    }
    const result = await ttsServices.createVoices(emails);
    res.json(result);
  } catch (err) {
    logger.error(`Error while create voice by email`, (err as any).message);
    next(err);
  }
}
