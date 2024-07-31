import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { cacheMiddleware } from '../middlewares/user.middleware';

export const userRoute = Router();

/* GET user */
userRoute.get('/:id', userController.getUsers);

/* POST user */
userRoute.post('/register', cacheMiddleware, userController.register);
