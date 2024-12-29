import { Router } from 'express';
import * as generateController from '../controllers/generate.controller';
const generateRouter = Router();

generateRouter.get('/responses', generateController.getResponses);
generateRouter.get('/:mediaId/info', generateController.getResponse);
generateRouter.get('/:mediaId', generateController.getFile);

export default generateRouter;
