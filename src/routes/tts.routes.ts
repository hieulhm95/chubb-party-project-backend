import { Router } from 'express';
import * as ttsController from '../controllers/tts.controller';
import * as emailController from '../controllers/email.controller';
const ttsRouter = Router();

ttsRouter.post('/create-voice', ttsController.createVoice);
ttsRouter.post('/callback', ttsController.createVoiceCallback);
ttsRouter.post('/qrcode', ttsController.createQRCode);
ttsRouter.post('/send-email', emailController.sendEmail);

export default ttsRouter;
