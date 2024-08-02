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
    const { firstName, lastName, email, company } = req.body;
    const normalizeEmail = email.toLowerCase().trim();
    const isUserExitst = await userServices.checkUserExist(normalizeEmail);
    if (isUserExitst) {
      return res.status(400).send({ error: 'Tài khoản này đã được đăng ký' });
    }
    res.json(await userServices.create({ firstName, lastName, email: normalizeEmail, company }));
  } catch (err) {
    console.error(`Error while create user`, (err as any).message);
    next(err);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const updateData = req.body;
    const { email } = updateData;
    if (!email) {
      return res.status(400).send({ error: 'Yêu cầu không hợp lệ' });
    }
    res.json(await userServices.update(updateData));
  } catch (err) {
    console.error(`Error while update user`, (err as any).message);
    next(err);
  }
}
