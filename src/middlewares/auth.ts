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
    const authUrl = `https://auth.akuya.tech/api/auth/signup`;
    const req = await $axios.post(authUrl, { token });
    const resp = req.data;

    console.log(resp);

    (req as any).user['id'] = {};
    next();
  } catch (err) {
    logger.error(`Forbidden: ${err.message}`);
    return res.status(403).json({ message: 'Forbidden' });
  }
}
