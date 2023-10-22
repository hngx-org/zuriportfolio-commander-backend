import { AuthenticatedMiddleware } from '@types';
import $axios from '../config/axios';
import logger from '../config/logger';
import { NextFunction, Request, Response } from 'express';
import prisma from '../config/prisma';

export async function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    // make api call to verify access token
    const authUrl = `https://staging.zuri.team/api/auth/api/authorize`;
    const request = await $axios.post(authUrl, { token });
    const resp: AuthenticatedMiddleware = request.data;

    if (!resp?.authorized) {
      logger.error(resp);
      return res.status(403).json({ message: resp?.message });
    }

    if (!(req as any).user) (req as any).user = {};
    (req as any).user.id = resp.user?.id;

    // check if user exists or not
    const user = await prisma.user.findFirst({
      where: { id: resp.user?.id },
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({
        message: `user not found for this action`,
      });
    }
    next();
  } catch (err) {
    // console.log(err);
    const msg = err.response?.data?.error ?? err.response?.data?.message ?? err.message;
    logger.error(`Forbidden: ${msg}`);
    return res.status(403).json({ message: msg });
  }
}
