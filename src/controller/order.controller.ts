import { Request, Response } from 'express';
import BaseController from './base.controller';
import prisma from '../config/prisma';

// import { PrismaClient } from '@prisma/client';


// const prisma = new PrismaClient();

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
        // merchant: true,
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
      { data: order }, // Include the order data in the response
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


  async getOrderByProductName(req: Request | any, res: Response | any) {
    const { name } = req.params;
    const { page = 1, pageSize = 10 } = req.query;
    try {
      const orderItems = await prisma.order_item.findMany({
        include: {
          product: true,
        },
        where: {
          product: {
            name: {
              contains: name,
              mode: 'insensitive', // Case-insensitive search
            },
          },
        },
        skip: (+page - 1) * +pageSize,
        take: +pageSize,
      });
  
      this.success(res, '--order/all', 'orders fetched successfully', 200, orderItems);
    } catch (error) {
      return this.error(res, '--order/internal-server-error', 'Internal server Error', 500);
    }
  }
}
