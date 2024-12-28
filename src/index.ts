import * as dotenv from 'dotenv';
dotenv.config();
import express, { Express, json, Request, Response, urlencoded } from 'express';
import pinoHttp from 'pino-http';
import { logger } from './utils/logger';
import redisRouter from './routes/redis.routes';
import generateRouter from './routes/generate.routes';
import MongoDB from './utils/mongo';
import { DATABASE_URL } from './configs/configs';
const cors = require('cors');

const app: Express = express();
const port = process.env.PORT || 4000;
const hostname = process.env.HOST || "127.0.0.1";
function bootstrap() {
  new MongoDB(DATABASE_URL);
}

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

app.use('/redis', redisRouter);
app.use('/generate', generateRouter);

app.listen(port, hostname, () => {
  bootstrap();
  logger.info(`[Server]: Server is running at http://${hostname}:${port}`);
});
