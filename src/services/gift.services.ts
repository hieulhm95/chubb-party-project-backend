import { Redis } from 'ioredis';
import { REDIS_URI } from '../configs/configs';
import fs from 'fs';
import path from 'path';

let redis = new Redis(REDIS_URI);

async function getGiftsStorage() {
  let giftCacheData = await redis.get('gifts');
  if (giftCacheData) {
    return JSON.parse(giftCacheData);
  }
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, '../data/gift.json'), 'utf8', (err, data) => {
      if (err) {
        reject(err);
      }
      const parsedData = JSON.parse(data);
      redis.set('gifts', JSON.stringify(parsedData));
      resolve(parsedData);
    });
  });
}

export async function getSelectedGift() {
  const gifts = await getGiftsStorage();
  const remainGift = gifts.filter((gift: { quantity: number; id: number }) => gift.quantity > 0);
  if (remainGift.length === 0) {
    return 0;
  }
  const randomGift = remainGift[Math.floor(Math.random() * remainGift.length)];
  return randomGift.id;
}

export async function updateGiftsStorage(giftId: Number) {
  const gifts = await getGiftsStorage();
  const giftIndex = gifts.findIndex((gift: { id: Number; quantity: Number }) => gift.id === giftId);
  if (giftIndex === -1) {
    return;
  }
  if (gifts[giftIndex].quantity === 0) {
    return;
  }
  gifts[giftIndex].quantity -= 1;
  await redis.set('gifts', JSON.stringify(gifts));
}
