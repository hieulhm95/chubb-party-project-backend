import { DEFAULT_GIFT } from '../utils/constant';
import { getFromRedisCache, saveToRedisCache } from '../utils/utils';

async function getGiftsStorage() {
  let giftCacheData = await getFromRedisCache('gifts');
  if (giftCacheData) {
    return giftCacheData;
  }
  await saveToRedisCache('gifts', DEFAULT_GIFT);
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
  await saveToRedisCache('gifts', gifts);
}
