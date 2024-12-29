import { Request, Response, NextFunction } from 'express';
import { Redis } from 'ioredis';
import { REDIS_URI } from '../configs/configs';
import { getAllRowsWithCells } from '../utils/googleApis';
import { saveToRedisCache } from '../utils/utils';

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

export async function syncDataFromSheetToRedis(req: Request, res: Response, next: NextFunction) {
  try {
    const rows = await getAllRowsWithCells(0);
    for (const key in rows) {
      await saveToRedisCache(key, rows[key]);
    }
    res.json({ message: 'Data synced successfully', rows, total: rows.length });
  } catch (err) {
    console.error('Error while syncing data:', err);
    next(err);
  }
}
