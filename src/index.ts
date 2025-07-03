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
import { getIO, initWebSocket } from './services/websocket.service';
const cors = require('cors');

const app: Express = express();
const server = createServer(app);
const port = process.env.PORT || 4000;
const hostname = process.env.HOST || '0.0.0.0'; // Changed to bind to all interfaces for production
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

app.use('/api/user', userRouter);
app.post('/api/media/play', (req: Request, res: Response) => {
  try {
    if (!req.body.phase) {
      return res.status(400).json({ message: 'Phase is required' });
    }
    const { phase } = req.body;
    // Emit to all connected clients
    const io = getIO();
    io.emit('play', { phase });
    logger.info(`[Play]: ${phase}`);
    res.status(200).json({ message: 'Play updated successfully' });
  } catch (error) {
    logger.error(`[Play]: ${error}`);
    res.status(500).json({ message: 'Play updated failed' });
  }
});

app.post('/api/media/pause', (req: Request, res: Response) => {
  try {
    if (!req.body.phase) {
      return res.status(400).json({ message: 'Phase is required' });
    }
    const { phase } = req.body;
    // Emit to all connected clients
    const io = getIO();
    io.emit('pause', { phase });
    logger.info(`[Pause]: ${phase}`);
    res.status(200).json({ message: 'Pause updated successfully' });
  } catch (error) {
    logger.error(`[Pause]: ${error}`);
    res.status(500).json({ message: 'Pause updated failed' });
  }
});

server.listen(port, async () => {
  bootstrap();
  // Initialize WebSocket
  initWebSocket(server);
  // await scanner();
  logger.info(`[Server]: Server is running at http://${hostname}:${port}`);
  logger.info(`[WebSocket]: WebSocket server is ready for connections`);
});
