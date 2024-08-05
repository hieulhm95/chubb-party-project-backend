import { Redis } from 'ioredis';
import { REDIS_URI } from '../configs/configs';
import { DEFAULT_GIFT } from '../utils/constant';

let redis = new Redis(REDIS_URI);

async function getGiftsStorage() {
  let giftCacheData = await redis.get('gifts');
  if (giftCacheData) {
    return JSON.parse(giftCacheData);
  }
  await redis.set('gifts', JSON.stringify(DEFAULT_GIFT));
  return DEFAULT_GIFT;
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

export async function checkGiftInStock(giftId: Number) {
  const gifts = await getGiftsStorage();
  const selectedGift = gifts.find((gift: { id: Number }) => gift.id === giftId);
  if (!selectedGift) {
    return false;
  }
  return selectedGift.quantity > 0;
}

export async function updateGiftsStorage(giftId: Number, email: string) {
  const cachedUser = await redis.get(email);
  if (cachedUser && JSON.parse(cachedUser)?.isRewarded && JSON.parse(cachedUser)?.giftId) {
    return;
  }
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
