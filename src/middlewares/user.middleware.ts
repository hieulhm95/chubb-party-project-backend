import { Request, Response, NextFunction } from 'express';
import { convertBase64 } from '../utils/utils';
import { Redis } from 'ioredis';

let redis = new Redis();

export async function cacheMiddleware(req: Request, res: Response, next: NextFunction) {
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
