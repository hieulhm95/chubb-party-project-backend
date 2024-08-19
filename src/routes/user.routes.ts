import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import {
  cachePostMiddleware,
  cacheGetMiddleware,
  cacheUserPlayedMiddleware,
  cacheUserRewardedMiddleware,
} from '../middlewares/user.middleware';

export const userRoute = Router();

/* GET user */
userRoute.get('/', cacheGetMiddleware, userController.getUsers);

/* POST user */
userRoute.post('/register', cachePostMiddleware, userController.register);

/* UPDATE user */
userRoute.put('/', cacheUserPlayedMiddleware, userController.updateUser);

/* UPDATE reward info */
userRoute.put('/reward', cacheUserRewardedMiddleware, userController.updateReward);

/* POST question form */
userRoute.post('/question', userController.createQuestionForm);
