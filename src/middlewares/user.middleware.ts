import { Request, Response, NextFunction } from 'express';
import { convertBase64, getFromRedisCache, normalizeString } from '../utils/utils';
import { Redis } from 'ioredis';
import { REDIS_URI } from '../configs/configs';
import pino from 'pino';
import { logger } from '../utils/logger';

let redis = new Redis(REDIS_URI, {
  connectTimeout: 10000, // Increase connection timeout to 10 seconds
});

redis.on('connect', () => console.log('[Redis] connected successfully'));
redis.on('error', err => console.error('[Redis] connection error:', err));

export async function cachePostMiddleware(req: Request, res: Response, next: NextFunction) {
  const { email } = req.body;
  if (!email) {
    logger.error(`Invalid request: ${JSON.stringify(req.body)}`);
    return res.status(400).send({ error: 'Yêu cầu không hợp lệ' });
  }
  const cachedData = await getFromRedisCache(normalizeString(convertBase64(email)));
  if (cachedData) {
    logger.info(`Cached data found: ${JSON.stringify(cachedData)}`);
    return res.send(cachedData);
  }
  next();
}

export async function cacheGetMiddleware(req: Request, res: Response, next: NextFunction) {
  const { email } = req.query;
  if (!email) {
    logger.error(`Invalid request: ${JSON.stringify(req.query)}`);
    return res.status(400).send({ error: 'Yêu cầu không hợp lệ' });
  }
  const cachedData = await getFromRedisCache(normalizeString(email as string));
  if (cachedData) {
    logger.info(`Cached data found: ${JSON.stringify(cachedData)}`);
    return res.send(cachedData);
  }
  next();
}

export async function cacheUserPlayedMiddleware(req: Request, res: Response, next: NextFunction) {
  const { email } = req.body;
  if (!email) {
    logger.error(`Invalid request: ${JSON.stringify(req.body)}`);
    return res.status(400).send({ error: 'Yêu cầu không hợp lệ' });
  }
  const cachedData = await getFromRedisCache(normalizeString(convertBase64(email)));
  if (cachedData) {
    logger.info(`Cached data found: ${JSON.stringify(cachedData)}`);
    if (cachedData.isPlayed) {
      return res.send(JSON.parse(cachedData));
    }
  }
  next();
}

export async function cacheUserRewardedMiddleware(req: Request, res: Response, next: NextFunction) {
  const { email } = req.body;
  if (!email) {
    logger.error(`Invalid request: ${JSON.stringify(req.body)}`);
    return res.status(400).send({ error: 'Yêu cầu không hợp lệ' });
  }
  const cachedData = await getFromRedisCache(normalizeString(convertBase64(email)));
  if (cachedData) {
    logger.info(`Cached data found: ${JSON.stringify(cachedData)}`);
    if (!cachedData.isRewarded) {
      return res.send(JSON.parse(cachedData));
    }
  }
  next();
}
