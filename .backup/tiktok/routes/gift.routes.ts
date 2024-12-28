import { Router } from 'express';
import * as giftController from '../controllers/gift.controller';
const giftRouter = Router();

giftRouter.get('/', giftController.getGift);

export default giftRouter;
