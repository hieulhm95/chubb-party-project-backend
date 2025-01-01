import { NextFunction, Request, Response } from 'express';
import { logger } from "../utils/logger";
import * as giftServices from '../services/gift.services';

export async function getGift(req: Request, res: Response, next: NextFunction) {
  try {
    const isTheLuckyMan = await giftServices.checkWhoIsTheLuckyOne();
    if (!isTheLuckyMan) {
      return res.json({ giftId: 0 });
    }
    const result = await giftServices.getSelectedGift();
    res.json({ giftId: result });
  } catch (err) {
    logger.error(`Error while GET gifts`, (err as any).message);
    next(err);
  }
}
