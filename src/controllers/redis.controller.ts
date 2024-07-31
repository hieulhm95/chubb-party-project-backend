import { Router, Request, Response, NextFunction } from 'express';
import { Redis } from 'ioredis';
import { REDIS_URI } from '../configs/configs';

let redis = new Redis(REDIS_URI);

export async function listKeys(req: Request, res: Response, next: NextFunction) {
  try {
    const pattern = req.query.pattern || '*';
    const keys = await redis.keys(pattern as string);
    res.json({ keys });
  } catch (err) {
    console.error('Error while listing keys:', err);
    next(err);
  }
}
