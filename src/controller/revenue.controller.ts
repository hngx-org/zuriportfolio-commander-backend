import { Request, Response } from 'express';
import BaseController from './base.controller';
import { PrismaClient } from '@prisma/client';
import { TestUserId } from '../config/test';

const prisma = new PrismaClient();

export default class RevenueController extends BaseController {
  constructor() {
    super();
  }

  async getRevenue(req: Request, res: Response) {
    const timeframe = (req.query.timeframe as string)?.toLocaleLowerCase();
    const userId = (req as any).user?.id ?? TestUserId;

    if (!userId) {
      return this.error(res, '--product/error', 'User ID required', 400);
    }

    const validTimeframe = ['today', 'yesterday', 'all'];
    if (!validTimeframe.includes(timeframe)) {
      return this.error(res, '--revenue/invalid-timeframe', `Expected a valid timeframe, got ${timeframe}`, 400);
    }

    let response = { timeframe: timeframe, revenue: 0, currency: 'NGN' };
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    let startTime: Date, endTime: Date;
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
        break;
    }

    let orders = null;

    if ((timeframe as string) === 'all') {
      orders = await prisma.order_item.findMany({
        where: {
          merchant_id: userId,
          status: 'completed',
        },
        include: { product: true },
      });
    } else {
      orders = await prisma.order_item.findMany({
        where: {
          merchant_id: userId,
          createdAt: {
            gte: startTime,
            lt: endTime,
          },
          status: 'completed',
        },
        include: { product: true },
      });
    }

    if (orders.length > 0) {
      orders.forEach((ord) => {
        const promo = ord.promo_id;
        if (promo) {
          response['revenue'] += ord.order_price + ord.order_VAT - ord.order_discount;
          response['currency'] = ord.product.currency;
        } else {
          response['revenue'] += ord.order_price + ord.order_VAT;
          response['currency'] = ord.product.currency;
        }
      });
    }

    return this.success(res, '--revenue/success', 'revenue fetched successfully', 200, response);
  }
}
