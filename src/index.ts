import * as dotenv from 'dotenv';
dotenv.config();
import express, { Express, json, Request, Response, urlencoded } from 'express';
import pinoHttp from 'pino-http';
import { logger } from './utils/logger';
// import { userRoute } from './routes/user.routes';
// import redisRouter from './routes/redis.routes';
// import giftRouter from './routes/gift.routes';
import ttsRouter from './routes/tts.routes';
import redisRouter from './routes/redis.routes';
import generateRouter from './routes/generate.routes';
import emailRouter from './routes/email.routes';
import MongoDB from './utils/mongo';
import { DATABASE_URL } from './configs/configs';
import { getFileWithExtension } from './controllers/generate.controller';
const cors = require('cors');

const app: Express = express();
const port = process.env.PORT || 4000;
const hostname = process.env.HOST || '127.0.0.1';
function bootstrap() {
  new MongoDB(DATABASE_URL);
}

app.set("etag", false);

// Use Pino HTTP middleware
app.use(pinoHttp({ logger }));

// cors
app.use(cors({ credentials: true }));

// parsers
app.use(json({ limit: '64mb', type: 'application/json' }));
app.use(urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

// app.use('/user', userRoute);
// app.use('/redis', redisRouter);
// app.use('/gift', giftRouter);
app.use('/tts', ttsRouter);
app.use('/redis', redisRouter);
app.use('/generate', generateRouter);
app.use('/email', emailRouter);
app.get("/:mediaId", getFileWithExtension);

app.listen(port, hostname, () => {
  bootstrap();
  logger.info(`[Server]: Server is running at http://${hostname}:${port}`);
});
