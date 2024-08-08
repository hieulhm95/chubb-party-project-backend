import { NextFunction, Request, Response } from 'express';
import * as userServices from '../services/user.services';
import { decodeBase64 } from '../utils/utils';
import { logger } from '../utils/logger';

export async function getUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.query;
    const decodeEmail = decodeBase64(email as string);
    const normalizeEmail = decodeEmail.toLowerCase().trim();
    const result = await userServices.get(normalizeEmail);
    if (!result) {
      return res.status(404).send('User not found');
    }
    res.json(result);
  } catch (err) {
    logger.error(`Error while getting user: ${(err as any).message}`);
    next(err);
  }
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { firstName, lastName, email, company, device } = req.body;
    const normalizeEmail = email.toLowerCase().trim();
    const foundUser = await userServices.get(normalizeEmail);
    if (foundUser) {
      return res.json(foundUser);
    }
    const result = await userServices.create({
      firstName,
      lastName,
      email: normalizeEmail,
      company,
      device,
    });
    res.json(result);
  } catch (err) {
    logger.error(`Error while register user: ${(err as any).message}`);
    next(err);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const updateData = req.body;
    const result = await userServices.update(updateData);
    res.json(result);
  } catch (err) {
    logger.error(`Error while update user: ${(err as any).message}`);
    next(err);
  }
}

export async function updateReward(req: Request, res: Response, next: NextFunction) {
  try {
    const updateData = req.body;
    const result = await userServices.updateReward(updateData);
    res.json(result);
  } catch (err) {
    logger.error(`Error while update reward: ${(err as any).message}`);
    next(err);
  }
}
