import { Request, Response } from 'express';
import BaseController from './base.controller';
import prisma from '../config/prisma';
import { TestUserId } from '../config/test';

export default class ActivityController extends BaseController {
  constructor() {
    super();
  }

  async getActivities(req: Request, res: Response) {
    const userId = (req as any).user?.id ?? TestUserId;
    const allActivities = await prisma.activity.findMany({
      where: {
        user_id: userId,
      },
    });

    return this.success(res, '--activities/success', 'activities fetched successfully', 200, allActivities);
  }
}
