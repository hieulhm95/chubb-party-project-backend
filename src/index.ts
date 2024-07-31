import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/.env' });

import express, { Express, json, Request, Response, urlencoded } from 'express';
import { userRoute } from './routes/user.routes';
import redisRouter from './routes/redis.routes';
const cors = require('cors');

const app: Express = express();
const port = process.env.PORT || 4000;

// cors
app.use(cors({ credentials: true }));

// parsers
app.use(json({ limit: '64mb', type: 'application/json' }));
app.use(urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.use('/user', userRoute);
app.use('/redis', redisRouter);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
