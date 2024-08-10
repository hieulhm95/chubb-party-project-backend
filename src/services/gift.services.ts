import { DEFAULT_GIFT, REDIS_KEY, WIN_RATE } from '../utils/constant';
import { getFromRedisCache, saveToRedisCache } from '../utils/utils';

async function getGiftsStorage() {
  let giftCacheData = await getFromRedisCache(REDIS_KEY.GIFTS);
  if (giftCacheData) {
    return giftCacheData;
  }
  await saveToRedisCache(REDIS_KEY.GIFTS, DEFAULT_GIFT);
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

export async function checkWhoIsTheLuckyOne() {
  const countUsersRegistered = await getFromRedisCache(REDIS_KEY.COUNT_USERS_REGISTERED);
  if (!countUsersRegistered) {
    await saveToRedisCache(REDIS_KEY.COUNT_USERS_REGISTERED, 0);
    return false;
  }
  const count = countUsersRegistered;
  if (+count === WIN_RATE) {
    await saveToRedisCache(REDIS_KEY.COUNT_USERS_REGISTERED, 0);
    return true;
  }
  await saveToRedisCache(REDIS_KEY.COUNT_USERS_REGISTERED, +count + 1);
  return false;
}

export async function updateGiftsStorage(giftId: Number, email: string) {
  const cachedUser = await getFromRedisCache(email);
  if (cachedUser?.isRewarded && cachedUser?.giftId) {
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
  await saveToRedisCache(REDIS_KEY.GIFTS, gifts);
}
