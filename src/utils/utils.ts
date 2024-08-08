import { Redis } from 'ioredis';
import { REDIS_URI } from '../configs/configs';

let redis = new Redis(REDIS_URI);

export const convertBase64 = (str: string): string => {
  return Buffer.from(str).toString('base64');
};

export function decodeBase64(encodedStr: string): string {
  return Buffer.from(encodedStr, 'base64').toString('utf-8');
}

export async function saveToRedisCache(key: string, data: any) {
  redis.set(key, JSON.stringify(data));
}

export async function getFromRedisCache(key: string) {
  const cachedData = await redis.get(key);
  if (cachedData) {
    return JSON.parse(cachedData);
  }
  return null;
}

export function normalizeString(str: string): string {
  return str.toLowerCase().trim();
}
