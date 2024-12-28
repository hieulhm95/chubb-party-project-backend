import { Router } from 'express';
import * as redisController from '../controllers/redis.controller';
const redisRouter = Router();

redisRouter.get('/redis-keys', redisController.listKeys);
redisRouter.get('/sync-data', redisController.syncDataFromSheetToRedis);

export default redisRouter;
