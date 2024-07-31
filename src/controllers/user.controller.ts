import { NextFunction, Request, Response } from 'express';
import * as userServices from '../services/user.services';
import { Redis } from 'ioredis';
import { REDIS_URI } from '../configs/configs';

let redis = new Redis(REDIS_URI);

export async function getUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const { params } = req;
    const { id } = params;
    if (!id) {
      res.status(404).send();
    }
    res.json(await userServices.get(Number(req.query.page)));
  } catch (err) {
    console.error(`Error while getting user`, (err as any).message);
    next(err);
  }
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { firstName, lastName, email, company } = req.body;
    const normalizeEmail = email.toLowerCase().trim();
    // const isUserExitst = await userServices.checkUserExist(normalizeEmail);
    // if (isUserExitst) {
    //   return res.status(400).send({ error: 'Tài khoản này đã được đăng ký' });
    // }
    res.json(await userServices.create({ firstName, lastName, email: normalizeEmail, company }));
  } catch (err) {
    console.error(`Error while create user`, (err as any).message);
    next(err);
  }
}
