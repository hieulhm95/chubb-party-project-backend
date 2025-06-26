import * as dotenv from 'dotenv';
dotenv.config();
import express, { Express, json, Request, Response, urlencoded } from 'express';
import { createServer } from 'http';
import pinoHttp from 'pino-http';
import { logger } from './utils/logger';
import userRouter from './routes/user.routes';
import { MEDIA_DIR } from './configs/configs';
import path from 'path';
import fsPromise from 'fs/promises';
import { initWebSocket } from './services/websocket.service';
const cors = require('cors');

const app: Express = express();
const server = createServer(app);
const port = process.env.PORT || 4000;
const hostname = process.env.HOST || '127.0.0.1';
async function bootstrap() {
  const mediaDir = path.join(process.cwd(), MEDIA_DIR);
  try {
    await fsPromise.stat(mediaDir);
  } catch (_) {
    await fsPromise.mkdir(mediaDir);
  }
}

app.set('etag', false);

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

app.use('/user', userRouter);

server.listen(port, hostname, async () => {
  bootstrap();
  // Initialize WebSocket
  initWebSocket(server);
  // await scanner();
  logger.info(`[Server]: Server is running at http://${hostname}:${port}`);
  logger.info(`[WebSocket]: WebSocket server is ready for connections`);
});
