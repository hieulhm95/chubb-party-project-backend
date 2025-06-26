import { Router } from 'express';
import * as userController from '../controllers/user.controller';

const userRouter = Router();

userRouter.post('/submit', userController.submitUsername);
userRouter.get('/users', userController.getUsers);

export default userRouter;
