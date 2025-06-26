import { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger';
import { getIO } from '../services/websocket.service';

export async function submitUsername(req: Request, res: Response, next: NextFunction) {
  try {
    const { username } = req.body;

    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Username is required and must be a non-empty string',
      });
    }

    const trimmedUsername = username.trim();

    // Emit to all connected clients
    const io = getIO();
    io.emit('userJoined', { username: trimmedUsername, timestamp: new Date().toISOString() });

    logger.info(`New user joined: ${trimmedUsername}`);

    res.status(201).json({
      success: true,
      message: 'Username submitted successfully',
      data: {
        username: trimmedUsername,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    logger.error(`Error while submitting username`, (err as any).message);
    next(err);
  }
}

export async function getUsers(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({
      success: true,
      data: [],
    });
  } catch (err) {
    logger.error(`Error while getting users`, (err as any).message);
    next(err);
  }
}
