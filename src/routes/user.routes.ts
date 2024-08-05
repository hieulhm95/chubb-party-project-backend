import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import {
  cachePostMiddleware,
  cacheGetMiddleware,
  cacheUserPlayedMiddleware,
} from '../middlewares/user.middleware';

export const userRoute = Router();

/* GET user */
userRoute.get('/', cacheGetMiddleware, userController.getUsers);

/* POST user */
userRoute.post('/register', cachePostMiddleware, userController.register);

/* UPDATE user */
userRoute.put('/', cacheUserPlayedMiddleware, userController.updateUser);
