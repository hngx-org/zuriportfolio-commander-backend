import { Request, Response } from 'express';
import BaseController from './base.controller';
import { PrismaClient } from '@prisma/client';
import { TestUserId } from '../config/test';

const prisma = new PrismaClient();

export default class RevenueController extends BaseController {
  constructor() {
    super();
  }

  async updateRevenue(req: Request, res: Response) {
    const { order_id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: order_id },
    });

    if (!order) {
      throw new Error('Order not found.');
    }

    if (order.status !== 'complete') {
      return res.status(400).json({ error: 'Order is not completed' });
    }

    // const revenueAmount = order.amount;

    const existingRevenue = await prisma.revenue.findFirst({
      where: {
        // user_id: order.merchantId,
      },
    });

    if (existingRevenue) {
      await prisma.revenue.update({
        where: {
          id: existingRevenue.id,
        },
        data: {
          // amount: existingRevenue.amount + revenueAmount,
        },
      });
    }

    this.success(res, 'revenues', 'Revenue updated successfully', 200, existingRevenue);
  }

  async getRevenueForToday(req: Request, res: Response) {
    const timeframe = (req.query.timeframe as string)?.toLocaleLowerCase();
    const userId = (req as any).user?.id ?? TestUserId;

    if (!timeframe) {
      this.error(res, '--revenue', 'Missing parameter timeframe', 400);
      return;
    }

    if (timeframe !== 'today') {
      this.error(res, '--revenue', 'Invalid timeframe', 400);
      return;
    }

    // Calculate the start and end time for today
    const today = new Date();
    const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    // fetch revenue data for today
    const todayRevenue = await prisma.revenue.findMany({
      where: {
        user_id: userId,
        createdAt: {
          gte: startTime,
          lte: endTime,
        },
      },
    });

    return this.success(res, '--revenue', 'Revenue fetched successfully', 200, { data: todayRevenue });
  }
}
