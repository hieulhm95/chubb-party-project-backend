import { NextFunction, Request, Response } from 'express';
import * as giftServices from '../services/gift.services';

export async function getGift(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await giftServices.getSelectedGift();
    res.json({ giftId: result });
  } catch (err) {
    console.error(`Error while GET gifts`, (err as any).message);
    next(err);
  }
}
