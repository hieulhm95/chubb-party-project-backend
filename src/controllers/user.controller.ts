import { NextFunction, Request, Response } from 'express';
import * as userServices from '../services/user.services';
import { decodeBase64 } from '../utils/utils';

export async function getUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.query;
    if (!email) {
      res.status(404).send();
    }
    const decodeEmail = decodeBase64(email as string);
    const normalizeEmail = decodeEmail.toLowerCase().trim();
    res.json(await userServices.get(normalizeEmail));
  } catch (err) {
    console.error(`Error while getting user`, (err as any).message);
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
    res.json(
      await userServices.create({
        firstName,
        lastName,
        email: normalizeEmail,
        company,
        device,
      })
    );
  } catch (err) {
    console.error(`Error while register user`, (err as any).message);
    next(err);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const updateData = req.body;
    res.json(await userServices.update(updateData));
  } catch (err) {
    console.error(`Error while update user`, (err as any).message);
    next(err);
  }
}

export async function updateReward(req: Request, res: Response, next: NextFunction) {
  try {
    const updateData = req.body;
    res.json(await userServices.updateReward(updateData));
  } catch (err) {
    console.error(`Error while update reward`, (err as any).message);
    next(err);
  }
}
