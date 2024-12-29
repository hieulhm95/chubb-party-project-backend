import { Router } from 'express';
import * as ttsController from '../controllers/tts.controller';
const ttsRouter = Router();

ttsRouter.post('/create-voice', ttsController.createVoice);
ttsRouter.post('/callback', ttsController.createVoiceCallback);

export default ttsRouter;
