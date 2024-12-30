import { Redis } from 'ioredis';
import { REDIS_URI } from '../configs/configs';

const globalAny = global as any;

if(!globalAny.redis) {
  globalAny.redis = new Redis(REDIS_URI);
}

export const redis: Redis = globalAny.redis;

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

export function formatValue(field: string, value: any) {
  if (value === null || value === undefined) {
    return '';
  }
  if (field === 'IsPlayed' || field === 'IsRewarded') {
    if (value === 'TRUE') {
      return true;
    } else {
      return false;
    }
  }
  return value;
}


export function mappingData<T extends {[key in string]: any}>(data: {[key in string]: any}, mappingRules: {[key in string]: string}) {
  const result = {} as any;

  const dataKeys = Object.keys(data);

  Object.keys(mappingRules).map(key => {
    const keyValue = mappingRules[key];

    if(dataKeys.includes(key)) {
      result[keyValue] = data[key];
    }
  })

  return result as T;
} 

export function mappingDataList<T extends {[key in string]: any}>(dataList: {[key in string]: any}[], mappingRules: {[key in string]: string}) {
  const length = dataList.length;
  const result = [] as T[];

  for(let i = 0; i < length; i++) {
    result.push(mappingData<T>(dataList[i], mappingRules))
  }

  return result;
} 