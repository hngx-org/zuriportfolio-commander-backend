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

  async createOrder(req: Request, res: Response) {
    const payload = req.body;

    const created = await prisma.order.create({ data: payload });

    this.success(res, '--order/created', 'order created', 200, created);
  }

  async getOrder(req: Request, res: Response) {
    const userId = (req as any).user?.id ?? TestUserId;
    const orderId = req.params['order_id'];


    const orderItem = await prisma.order_item.findFirst({
      where: {
        merchant_id: userId,
        order_id: orderId,
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
        },
        product: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!orderItem) {
      this.error(res, '--order/single', 'Order not found', 404);
    }

    this.success(res, '--order/single', 'Order fetched successfully', 200, orderItem);
  }



  async getAllOrders(req: Request, res: Response) {
    //const userId = req.user.id; // get the user id from the request params
    const userId = (req as any).user?.id || TestUserId;

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
        order_price: true,
        createdAt: true,
        merchant: {
          select: {
            revenue: {
              select: {
                amount: true,
              }
            },
            categories: {
              select: {
                name: true,
              }
            },
            customer_orders: {
              select: {
                status: true,
                sales_report: {
                  select: {
                    sales: true,
                  }
                }
              }
            }
          },
        },
        customer: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
        product: {
          select: {
            name: true,
          },
        },
      },
      skip: (+page - 1) * +pageSize,
      take: +pageSize,
    });
    if (!orders) {
      return this.error(res, '--order/all', 'An error occurred', 500, 'internal server error');
    }
    return this.success(res, '--order/all', 'Orders fetched successfully', 200, orders);
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

  async getAverageOrderValue(req: Request, res: Response) {
    const timeframe = (req.query.timeframe as string)?.toLocaleLowerCase();
    const merchantUserId = (req as any).user['id'];

    if (!timeframe) {
      this.error(res, '--order/average', 'Missing timeframe parameter', 400);
      return;
    }

    if (timeframe !== 'today') {
      this.error(res, '--order/average', 'Invalid timeframe parameter', 400);
      return;
    }

    // Calculate the start and end timestamps for today
    const currentDate = new Date();

    const startOfDay = new Date(currentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(currentDate);
    endOfDay.setHours(23, 59, 59, 999);


    const orderItems = await prisma.order_item.findMany({
      where: {
        merchant_id: merchantUserId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });


    const totalSales = orderItems.reduce((sum, item) => sum + item.order_price, 0);
    const averageSales = parseFloat((totalSales / orderItems.length).toFixed(2));

    this.success(res, '--order/average', 'Average order value for today fetched successfully', 200, {
      averageSales,
    });
  }

  async updateOrderStatus(req: Request, res: Response) {
    const userId = (req as any).user?.id ?? TestUserId;
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

    this.success(res, '--order/status', 'Order status updated successfully', 200, { data: updatedOrder });
  }

  async getOrderByProductName(req: Request | any, res: Response | any) {
    const userId = (req as any).user?.id ?? TestUserId;

    const { name } = req.params;
    const { page = 1, pageSize = 10 } = req.query;

    const orderItems = await prisma.order_item.findMany({
      where: {
        merchant_id: userId,
        product: {
          name: {
            contains: name,
            mode: 'insensitive', // Case-insensitive search
          },
        },
      },
      select: {
        order_id: true,
        order_price: true,
        createdAt: true,
        merchant: {
          select: {
            revenue: {
              select: {
                amount: true,
              },
            },
            categories: {
              select: {
                name: true,
              },
            },
            customer_orders: {
              select: {
                status: true,
                sales_report: {
                  select: {
                    sales: true,
                  },
                },
              },
            },
          },
        },
        customer: {
          select: {
            username: true,
          },
        },
        product: {
          select: {
            price: true,
            name: true,
          },
        },
      },
      skip: (+page - 1) * +pageSize,
      take: +pageSize,
    });

    if (!orderItems) {
      return this.error(res, '--orders/internal-server-error', 'Internal server Error', 500);
    }

    const response = {
      data: {
        totalResults: orderItems.length,
        orders: orderItems,
      },
    };

    this.success(res, '--orders/all', 'orders fetched successfully', 200, response);
  }
}