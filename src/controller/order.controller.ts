import { Request, Response } from 'express';
import BaseController from './base.controller';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default class OrderController extends BaseController {
  constructor() {
    super();
  }

  async createOrder(req: Request, res: Response) {
    const payload = req.body;

    const created = await prisma.order.create({ data: payload });

    this.success(res, '--order/created', 'order created', 200, created);
  }

  async getOrder(req: Request, res: Response) {
    // Assuming you have the order ID from the request params
    const orderId = req.params.order_id; // Replace with your actual parameter name

    // Fetch the order details from the database using Prisma
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
      },
      include: {
        customer: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Return the order data as part of the response
    this.success(
      res,
      '--product/updated',
      'product updated successfully',
      200,
      { data: order } // Include the order data in the response
    );
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

  // get orders withing a timeframe
  async getOrderTimeframe(req: Request, res: Response) {
    // getting the time frame from the query
    const { start_date, end_date } = req.query;
    // Fetch the order details from the database using Prisma

    const orders = await prisma.order.findMany({
      where: {
        created_at: {
          gte: new Date(`${start_date}`).toISOString(),
          lte: new Date(`${end_date}`).toISOString(),
        },
      },
    });

    if (!orders) {
      return res.status(404).json({ error: 'No Other Found within the time frame' });
    }

    // Return the order data as part of the response
    this.success(
      res,
      '--Order/all',
      'Oders returned successfully',
      200,
      { data: orders } // Include the order data in the response
    );
  }
}
