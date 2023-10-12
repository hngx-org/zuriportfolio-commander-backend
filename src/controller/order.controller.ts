import { Request, Response } from 'express';
import BaseController from './base.controller';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default class OrderController extends BaseController {
  constructor() {
    super();
  }

  async getOrder(req: Request, res: Response) {
    const orderId = req.params.order_id;

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
      },
      include: {
        merchant: true,
        customer: true,
      },
    });

    if (!order) {
      this.error(res, '--order/single', 'Order not found', 404);
    }

    this.success(res, '--order/single', 'Order fetched successfully', 200, order);
  }

  async getAllOrders(req: Request, res: Response) {
    const userId = req.params.id; // get the user id from the request params

    if (!userId) {
      this.error(res, '--order/all', 'This user id does not exist', 400, 'user not found');
    }

    const orders = await prisma.order.findMany({
      where: {
        id: userId,
      },
    });

    this.success(res, '--order/all', 'orders fetched successfully', 200, orders);
  }
}
