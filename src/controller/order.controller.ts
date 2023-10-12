import { Request, Response } from 'express';
import BaseController from './base.controller';
import { PrismaClient } from '@prisma/client';
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
    const userId = "1234";

    if (!userId) {
      return this.error(res, '--order/all', 'This user id does not exist', 400)
    }

    const orders = await prisma.user.findMany({
      where: {
        id: userId
      },
      include: {
        order_items: {
          where: {
            merchant_id: userId
          },
          include:{
            customer: {
              include: {
                customer_order_items:{
                  include:{
                    product: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!orders) {
      return this.error(res, '--order/all', 'Orders not found', 400)
    }

    this.success(res, '--order/all', 'orders fecthed successfully', 200, orders)

   
  }


  async getOrderByProductName(req: Request | any, res: Response | any) {
    const { name } = req.params;
    const { page = 1, pageSize = 10 } = req.query;
    
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

    if (!orderItems) {
      return this.error(res, '--orders/internal-server-error', 'Internal server Error', 500);
    }

    this.success(res, '--orders/all', 'orders fetched successfully', 200, orderItems);
  }
  async updateOrderStatus(req: Request, res: Response) {
    const userId = (req as any).user['id'];
    const orderId = req.params['order_id'];
    const newStatus = req.body.status;

    // Check if the order exists
    if (!newStatus || newStatus.trim() === '') {
      return this.error(res, '--order/status', 'Status cannot be empty', 400);
    }
    const existingOrder = await prisma.order.findFirst({
      where: {
        id: orderId,
      },
    });

    if (!existingOrder) {
      return this.error(res, '--order/status', 'Order not found', 404);
    }

    if (!validStatusValues.includes(newStatus)) {
      return this.error(res, '--order/status', 'Invalid status value', 400);
    }


    // Find the order item that matches the merchant and order
    const orderItem = await prisma.order_item.findFirst({
      where: {
        merchant_id: userId,
        order_id: orderId,
      },
    });

    if (!orderItem) {
      return this.error(res, '--order/status', 'Order item not found for the merchant and order', 404);
    }
    const updatedOrder = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: newStatus,
      },
    });

    this.success(
      res,
      '--order/status',
      'Order status updated successfully',
      200,
      { data: updatedOrder }
    );
  }
}
