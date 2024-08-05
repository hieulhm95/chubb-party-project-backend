import { Request, Response, NextFunction } from 'express';
import { convertBase64 } from '../utils/utils';
import { Redis } from 'ioredis';
import { REDIS_URI } from '../configs/configs';

let redis = new Redis(REDIS_URI, {
  connectTimeout: 10000, // Increase connection timeout to 10 seconds
});

redis.on('connect', () => console.log('[Redis] connected successfully'));
redis.on('error', err => console.error('[Redis] connection error:', err));

export async function cachePostMiddleware(req: Request, res: Response, next: NextFunction) {
  const { email } = req.body;
  if (!email) {
    return res.status(400).send({ error: 'Yêu cầu không hợp lệ' });
  }
  const base64Email = convertBase64(email);
  const cachedData = await redis.get(base64Email);
  if (cachedData) {
    console.log('cachedData', cachedData);
    return res.send(JSON.parse(cachedData));
  }
  next();
}

export async function cacheGetMiddleware(req: Request, res: Response, next: NextFunction) {
  const { email } = req.query;
  if (!email) {
    return res.status(400).send({ error: 'Yêu cầu không hợp lệ' });
  }
  const cachedData = await redis.get(email as string);
  if (cachedData) {
    console.log('cachedData', cachedData);
    return res.send(JSON.parse(cachedData));
  }
  next();
}

export async function cacheUserPlayedMiddleware(req: Request, res: Response, next: NextFunction) {
  const { email } = req.body;
  if (!email) {
    return res.status(400).send({ error: 'Yêu cầu không hợp lệ' });
  }
  const base64Email = convertBase64(email);
  const cachedData = await redis.get(base64Email);
  if (cachedData) {
    const parseData = JSON.parse(cachedData);
    console.log('cachedData', cachedData);
    if (parseData.isPlayed) {
      return res.send(JSON.parse(cachedData));
    }
  }
  next();
}
