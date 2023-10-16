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

  // get order by id
  async getOrder(req: Request, res: Response) {
    const userId = (req as any).user?.id ?? TestUserId;
    const orderId = req.params['order_id'];

    console.log({ userId });

    if (!userId) {
      return this.error(res, '--order/all', 'This user id does not exist', 400, 'user not found');
    }

    const page = parseInt(req.query.page?.toString()) || 1;
    const pageSize = parseInt(req.query.pageSize?.toString()) || 10;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const merchantOrders = await prisma.order_item.findMany({
      where: {
        AND: {
          order_id: orderId,
          merchant_id: userId,
        },
      },
      include: {
        order: true,
      },
      skip,
      take,
    });

    if (merchantOrders.length === 0) {
      return this.error(res, '--order/order_not_found', `Order not found`, 404);
    }

    const orderMap = new Map();
    const userInfoMap = new Map();

    for (const ord of merchantOrders) {
      const orderKey = ord.order_id;

      if (!orderMap.has(orderKey)) {
        orderMap.set(orderKey, {
          id: orderKey,
          order_status: ord.order.status,
          date: ord.order.createdAt,
          customerInfo: {},
          items: [],
        });
      }

      // Check if userInfo is already in the map to avoid repeated queries
      if (!userInfoMap.has(ord.customer_id)) {
        const userInfo = await prisma.user.findFirst({
          where: { id: ord.customer_id },
        });
        if (userInfo) {
          userInfoMap.set(ord.customer_id, userInfo);
        }
      }

      // Retrieve userInfo from the map
      const userInfo = userInfoMap.get(ord.customer_id);
      orderMap.get(orderKey).customerInfo = {
        id: userInfo?.id || '',
        firstName: userInfo?.first_name || '',
        lastName: userInfo?.last_name || '',
      };

      const products = await prisma.product.findFirst({
        where: {
          id: ord.product_id,
        },
        select: {
          id: true,
          name: true,
          description: true,
          is_deleted: true,
          currency: true,
          createdAt: true,
          image: true,
          category_id: true,
        },
      });

      if (products) {
        orderMap.get(orderKey).items.push({
          ...products,
          price: ord.order_price,
          order_item_status: ord.status,
          category: await prisma.product_category.findFirst({
            where: { id: products.category_id },
            include: { sub_categories: true },
          }),
        });
      }
    }

    const allOrders = Array.from(orderMap.values());

    const response = {
      orders: allOrders,
      page: +page,
      pageSize: +pageSize,
      totalOrders: merchantOrders.length, // Use the length of merchantOrders
      totalPages: Math.ceil(merchantOrders.length / pageSize), // Use the length of merchantOrders
    };
    return this.success(res, '--order/success', 'Orders fetched successfully', 200, response);
  }

  async getAllOrders(req: Request, res: Response) {
    const userId = (req as any).user?.id || TestUserId;

    if (!userId) {
      return this.error(res, '--order/all', 'This user id does not exist', 400, 'user not found');
    }

    const page = parseInt(req.query.page?.toString()) || 1;
    const pageSize = parseInt(req.query.pageSize?.toString()) || 10;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const merchantOrders = await prisma.order_item.findMany({
      where: {
        merchant_id: userId,
      },
      include: {
        order: true,
      },
      skip,
      take,
    });

    const orderMap = new Map();
    const userInfoMap = new Map();

    for (const ord of merchantOrders) {
      const orderKey = ord.order_id;

      if (!orderMap.has(orderKey)) {
        orderMap.set(orderKey, {
          id: orderKey,
          order_status: ord.order.status,
          date: ord.order.createdAt,
          customerInfo: {},
          items: [],
        });
      }

      // Check if userInfo is already in the map to avoid repeated queries
      if (!userInfoMap.has(ord.customer_id)) {
        const userInfo = await prisma.user.findFirst({
          where: { id: ord.customer_id },
        });
        if (userInfo) {
          userInfoMap.set(ord.customer_id, userInfo);
        }
      }

      // Retrieve userInfo from the map
      const userInfo = userInfoMap.get(ord.customer_id);
      orderMap.get(orderKey).customerInfo = {
        id: userInfo?.id || '',
        firstName: userInfo?.first_name || '',
        lastName: userInfo?.last_name || '',
      };

      const products = await prisma.product.findFirst({
        where: {
          id: ord.product_id,
        },
        select: {
          id: true,
          name: true,
          description: true,
          is_deleted: true,
          currency: true,
          createdAt: true,
          image: true,
          category_id: true,
        },
      });

      if (products) {
        orderMap.get(orderKey).items.push({
          ...products,
          price: ord.order_price,
          order_item_status: ord.status,
          category: await prisma.product_category.findFirst({
            where: { id: products.category_id },
            include: { sub_categories: true },
          }),
        });
      }
    }

    const allOrders = Array.from(orderMap.values());

    const response = {
      orders: allOrders,
      page: +page,
      pageSize: +pageSize,
      totalOrders: merchantOrders.length, // Use the length of merchantOrders
      totalPages: Math.ceil(merchantOrders.length / pageSize), // Use the length of merchantOrders
    };
    return this.success(res, '--order/all', 'Orders fetched successfully', 200, response);
  }

  async getOrdersCountByTimeframe(req: Request, res: Response) {
    const { timeframe } = req.query;
    const userId = (req as any).user?.id || TestUserId;

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
      case 'two-weeks-ago':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(startDate.getDate() - 14);
        break;

      default:
        this.success(res, 'error', 'invalid timeframe', 400);
    }

    let orderCount = 0;
    const orderItems = await prisma.order_item.findMany({
      where: {
        merchant_id: userId,
      },
    });

    for (const order of orderItems) {
      const ord = await prisma.order_item.findFirst({
        where: {
          customer_id: order.customer_id,
        },
      });
      if (ord !== null) {
        orderCount++;
      }
    }

    this.success(res, 'order Counted', ` successfully returned orders within ${timeframe} `, 200, {
      orderCount,
    });
  }

  async getAverageOrderValue(req: Request, res: Response) {
    const timeframe = (req.query.timeframe as string)?.toLocaleLowerCase();
    const merchantUserId = (req as any).user?.id ?? TestUserId;

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

    if (orderItems.length === 0) {
      this.success(res, '--order/average', 'No order items found for today', 200, {
        averageOrderValue: 0,
      });
      return;
    }

    const totalSales = orderItems.reduce((sum, item) => sum + item.order_price, 0);
    const averageOrderValue = parseFloat((totalSales / orderItems.length).toFixed(2));

    this.success(res, '--order/average', 'Average order value for today fetched successfully', 200, {
      averageOrderValue,
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
            first_name: true,
            last_name: true,
          },
        },
        product: {
          select: {
            price: true,
            name: true,
            category_id: true,
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
