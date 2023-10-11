import { AuthenticatedMiddleware } from '@types';
import $axios from '../config/axios';
import logger from '../config/logger';
import { NextFunction, Request, Response } from 'express';

export async function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    // make api call to verify access token
    const authUrl = `https://auth.akuya.tech/api/authorize`;
    const request = await $axios.post(authUrl, { token });
    const resp: AuthenticatedMiddleware = request.data;

    if (!resp?.authorized) {
      logger.error(resp);
      return res.status(403).json({ message: resp?.message });
    }

    if (!(req as any).user) (req as any).user = {};
    (req as any).user.id = resp.user?.id;
    next();
  } catch (err) {
    const msg = err.response?.data?.message ?? err.message;
    logger.error(`Forbidden: ${msg}`);
    return res.status(403).json({ message: msg });
  }
}
