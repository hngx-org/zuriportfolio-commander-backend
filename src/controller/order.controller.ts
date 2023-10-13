import { Request, Response } from 'express';
import BaseController from './base.controller';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default class OrderController extends BaseController {
  constructor() {
    super();
  }

  // async getOrder(req: Request, res: Response) {
  //   // Assuming you have the order ID from the request params
  //   const orderId = req.params.order_id; // Replace with your actual parameter name

  //   // Fetch the order details from the database using Prisma
  //   const order = await prisma.order.findFirst({
  //     where: {
  //       id: orderId,
  //     },
  //     include: {
  //       merchant: true,
  //       customer: true,
  //     },
  //   });

  //   if (!order) {
  //     return res.status(404).json({ error: 'Order not found' });
  //   }

  //   // Return the order data as part of the response
  //   this.success(
  //     res,
  //     '--product/updated',
  //     'product updated successfully',
  //     200,
  //     { data: order }, // Include the order data in the response
  //   );
  // }

  async getAllOrders(req: Request, res: Response) {
    const userId = req.params.id; // get the user id from the request params

    console.log(userId);

    if (!userId) {
      this.error(res, '--order/all', 'This user id does not exist', 400, 'user not found');
    }

    const orders = await prisma.order.findMany({
      where: {
        id: userId,
      },
    });

    console.log(orders);

    this.success(res, '--order/all', 'orders fetched successfully', 200, orders);
  }

  async getOrdersCountByTimeframe(req: Request, res: Response) {
    const { timeframe } = req.query;

    let startDate: Date;
    let endDate: Date = new Date(); // default to cuo the current date
    endDate.setHours(23, 59, 59, 999);

    switch (timeframe) {
      case 'today':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(startDate.getDate() - 1);
        endDate.setDate(endDate.getDate() - 1);
        break;
      case 'one-week-ago':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(startDate.getDate() - 7);
        break;
        break;
      case 'two-weeks-ago':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(startDate.getDate() - 14);
        break;

      default:
        this.success(res, 'error', 'invalid timeframe', 400);
    }
    console.log(startDate, endDate);
    const orderCount = await prisma.order.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
    this.success(res, 'order Counted', ` successfully returned orders within ${timeframe} `, 200, {
      orderCount,
    });
  }
}
