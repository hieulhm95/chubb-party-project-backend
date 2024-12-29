import { Router } from 'express';
import * as emailController from '../controllers/email.controller';
const emailRouter = Router();

emailRouter.post('/qrcode', emailController.createQRCode);
emailRouter.post('/send', emailController.sendEmail);

export default emailRouter;
