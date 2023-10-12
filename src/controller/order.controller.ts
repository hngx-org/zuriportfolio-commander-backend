import { Request, Response } from 'express';
import BaseController from './base.controller';
import { PrismaClient } from '@prisma/client';
import { TestUserId } from '../config/test';
const validStatusValues = ['pending', 'complete', 'failed'];

const prisma = new PrismaClient();

export default class OrderController extends BaseController {
  constructor() {
    super();
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
        //merchant: true,
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

  async getAllOrders(req: Request | any, res: Response | any) {
    //const userId = (req as any).user?.id;
    const userId = "1";
    if (!userId) {
       return this.error(res, '--order/all', 'This user id does not exist', 400, 'user not found');
    }
    const { page = 1, pageSize = 10 } = req.query;
    const orders = await prisma.order_item.findMany({
      where: {
        merchant_id: userId,
      },
      select: {
        order_id: true,
        createdAt: true,
        merchant: {
          select: {
            customer_orders: {
              select: {
                status: true,
              },
            },
          },
        },
        customer: {
          select: {
            username: true,
          },
          
        }
      },
      skip: (+page - 1) * +pageSize,
      take: +pageSize,
    });
  if (!orders) {
    return this.error(res, '--order/all', 'An error occurred', 500, 'internal server error');
  }
  return this.success(res, '--order/all', 'orders fetched successfully', 200, orders);
  }
}
