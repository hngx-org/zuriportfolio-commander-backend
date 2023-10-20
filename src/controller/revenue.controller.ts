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
    const merchantUserId = (req as any).user?.id ?? TestUserId;
    const { order_id } = req.params;

    if (!order_id) {
      return this.error(res, '--order/missing order_id', 'Please provide a valid order ID', 400);
    }

    const order = await prisma.order.findUnique({
      where: { id: order_id },
    });

    if (!order) {
      return this.error(res, '--order/not-found', 'Order not found', 400);
    }

    if (order.status !== 'completed') {
      return this.error(res, '--order/not-completed', 'Order is not completed', 400);
    }

    const revenueAmount = order.subtotal;

    const existingRevenue = await prisma.revenue.findFirst({
      where: {
        user_id: merchantUserId,
      },
    });

    let updatedRevenue;

    if (existingRevenue) {
      updatedRevenue = await prisma.revenue.update({
        where: {
          id: existingRevenue.id,
        },
        data: {
          amount: existingRevenue.amount + revenueAmount,
        },
      });
    }

    this.success(res, '--revenues', 'Revenue updated successfully', 200, updatedRevenue);
  }

  async getRevenue(req: Request, res: Response) {
    const timeframe = (req.query.timeframe as string)?.toLocaleLowerCase();
    const userId = (req as any).user?.id ?? TestUserId;

    if (!timeframe) {
      this.error(res, '--revenue', 'Missing parameter timeframe', 400);
      return;
    }

    // Calculate the start and end time for today
    let startTime: Date, endTime: Date;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
  
    switch (timeframe) {
      case 'today':
        startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
        endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        break;
      case 'yesterday':
        startTime = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0);
        endTime = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59);
        break;
      default:
        this.error(res, '--revenue', 'Invalid timeframe', 400);
        return;
    }
  
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

    if (todayRevenue.length === 0) {
      this.success(res, '--revenue', `No revenue found for ${timeframe}`, 200, {
        todayRevenue: 0,
      });
      return;
    }

    return this.success(res, '--revenue', `Revenue for ${timeframe} fetched successfully`, 200, { 
      todayRevenue 
    });
  }
}
