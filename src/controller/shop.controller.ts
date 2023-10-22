import { Request, Response } from 'express';
import BaseController from './base.controller';
import { createShopSchema, productSchema, createShopTrafficSchema } from '../helper/validate';
import logger from '../config/logger';
import { AddProductPayloadType } from '@types';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/prisma';
import { TestUserId } from '../config/test';
import { isUUID } from '../helper';

export default class ShopController extends BaseController {
  constructor() {
    super();
  }

  async createShop(req: Request, res: Response) {
    const merchant_id = (req as any).user?.id ?? TestUserId;
    const { error } = createShopSchema.validate(req.body);
    if (error) {
      return this.error(res, '--shop/invalid-fields', error?.message ?? 'missing shop details.', 400, null);
    }
    const { name } = req.body;
    const id = uuidv4();

    // check if user has a shop created already
    const createdShops = await prisma.shop.findMany({
      where: { merchant_id },
    });

    if (createdShops.length > 0) {
      return this.error(res, '--shop/shops-exists', `Sorry, you can only create one shop per account.`, 400);
    }
    const shop = await prisma.shop.create({
      data: {
        id,
        name,
        admin_status: 'approved',
        policy_confirmation: true,
        restricted: 'no',
        reviewed: true,
        merchant: {
          connect: {
            id: merchant_id,
          },
        },
      },
    });

    this.success(res, '--shop/created', 'shop created', 200, shop);
  }

  async deleteShop(req: Request, res: Response) {
    const { id } = req.params;
    const merchant_id = (req as any).user?.id ?? TestUserId;
    const shop = await prisma.shop.findFirst({
      where: {
        AND: {
          merchant_id,
          id,
        },
      },
    });

    if (shop === null) {
      return this.error(res, '--shop/not-found', 'shop not found', 404);
    }

    await prisma.shop.update({
      where: {
        id,
      },
      data: {
        is_deleted: 'temporary',
      },
    });

    this.success(res, '--shop/deleted', 'shop deleted', 200, null);
  }

  // Get all shop controller
  async getMerchantShops(req: Request, res: Response) {
    const merchant_id = (req as any).user?.id ?? TestUserId;
    const shop = await prisma.shop.findFirst({
      where: {
        AND: {
          merchant_id,
          is_deleted: 'active',
        },
      },
    });
    this.success(res, '--shops/success', 'Shop fetched successfully.', 200, shop);
  }

  // Get merchant shops
  async getAllShops(req: Request, res: Response) {
    const shops = await prisma.shop.findMany();
    if (shops.length > 0) {
      this.success(res, 'All shops', 'Shops have been listed successfully', 200, shops);
    } else {
      this.success(res, '--shops-isEmpty', 'No Shops Found', 200, []);
    }
  }

  // Update existing shop controller
  async updateShop(req: Request, res: Response) {
    const shopId = req.params.shop_id;
    const userId = (req as any).user['id'];

    if (shopId === undefined) {
      return this.error(res, '--shop/ShortId empty', 'Short ID cannot be empty', 400);
    }

    const shop = await prisma.shop.findFirst({
      where: { id: shopId },
    });

    if (!shop) {
      return this.error(res, '--shop/not-found', 'Shop does not exist', 404);
    }

    if (shop.merchant_id !== userId) {
      return this.error(res, '--shop/not-authorized', 'You are not authorized to update this shop', 401);
    }

    // check if fields are empty
    const payload = req.body;

    const { name } = payload;

    // update shop
    const updatedShop = await prisma.shop.update({
      where: { id: shopId },
      data: {
        name,
      },
    });

    this.success(res, '--shop/updated', 'shop updated', 200, updatedShop);
  } // end of updateShop

  // start of shop traffic
  async shopTraffic(req: Request, res: Response) {
    const data = req.body;
    data.ip_addr = req.socket.remoteAddress;
    logger.info(data.ip_addr);

    const { error, value } = createShopTrafficSchema.validate(data);

    if (error) {
      return this.error(res, '--shop/store-traffic', error?.message ?? 'missing required field.', 400, null);
    }
    const shopExists = await prisma.shop.findFirst({ where: { id: data.shop_id } });

    if (!shopExists) {
      return this.error(res, '--shop/store-traffic', 'shop doesnt exits', 401, null);
    }

    await prisma.store_traffic.create({ data });

    this.success(res, '--shop/store-traffic', 'traffic added', 200, null);
  } // end of shop traffic

  // Fetch the shop by its ID
  async getShopId(req: Request, res: Response) {
    const shopId = req.params.shop_id;

    if (!isUUID(shopId)) {
      return this.error(res, '--shop/invalid-id', 'Invalid uuid format.', 400);
    }

    // Fetch the shop associated with the merchant, including all its products
    const shop = await prisma.shop.findFirst({
      where: {
        AND: {
          id: shopId,
          is_deleted: 'active',
        },
      },
      include: {
        products: {
          where: {
            is_deleted: 'active',
          },
          include: {
            image: true,
          },
        },
      },
    });

    if (!shop) {
      return this.error(res, '--shop/missing-shop', 'Shop not found.', 404, null);
    }
    logger.info(shop);
    return this.success(
      res,
      `Shop and Products for Merchant ${shopId} Shown`,
      'Shop and its products retrieved successfully',
      200,
      shop
    );
  }

  async getShopTrafficByFullYear(req: Request, res: Response) {
    const { shop_id } = req.params;

    const currentDate = new Date();
    const endDate = new Date(currentDate);
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date(endDate);
    startDate.setMonth(endDate.getMonth() - 11);

    const shopTraffic = await prisma.store_traffic.findMany({
      where: {
        shop_id: shop_id,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const result = [];

    let currentMonth = startDate.getMonth();
    let currentYear = startDate.getFullYear();

    for (let i = 0; i < 12; i++) {
      const monthlyTraffic = shopTraffic.filter((entry) => {
        const entryDate = new Date(entry.createdAt);
        return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
      });

      result.push({
        timeframe: await this.getMonthName(currentMonth),
        year: `${currentYear}`.trim(),
        traffic: monthlyTraffic.length,
      });

      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
    }

    return this.success(res, '--shopTraffic/successful', 'Store traffic found for the last 12 months', 200, result);
  }

  async getMonthName(monthNumber) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames[monthNumber];
  }

  async getShopTrafficByThreeMonths(req: Request, res: Response) {
    const { shop_id } = req.params;

    const endDate = new Date(); // Set end date to the current date
    endDate.setHours(23, 59, 59, 999); // Set end date to the end of the day

    const startDate = new Date(endDate);
    startDate.setMonth(endDate.getMonth() - 2); // Set start date to 2 months ago

    const shopTraffic = await prisma.store_traffic.findMany({
      where: {
        shop_id: shop_id,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        createdAt: 'asc', // Ensure results are ordered by creation date
      },
    });

    const result = [];

    let currentMonth = startDate.getMonth();
    const currentDate = new Date(startDate);

    for (let i = 0; i < 3; i++) {
      const monthlyTraffic = shopTraffic.filter((entry) => {
        const entryDate = new Date(entry.createdAt);
        return entryDate.getMonth() === currentMonth;
      });

      result.push({
        timeframe: `${currentDate.toLocaleString('default', { month: 'short' })}`,
        year: `${currentDate.getFullYear()}`.trim(),
        traffic: monthlyTraffic.length,
      });

      currentMonth++;
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return this.success(res, '--shopTraffic/successful', 'Store traffic found for the last 3 months', 200, result);
  }

  async getOrdinalSuffix(n) {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
  }

  async getShopTrafficForLast30Days(req: Request, res: Response) {
    const { shop_id } = req.params;

    const endDate = new Date(); // Set end date to the current date
    endDate.setHours(23, 59, 59, 999); // Set end date to the end of the day

    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 29); // Set start date to 29 days ago

    const shopTraffic = await prisma.store_traffic.findMany({
      where: {
        shop_id: shop_id,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const result = [];

    const currentDate = new Date(startDate);
    for (let i = 0; i < 30; i++) {
      const dailyTraffic = shopTraffic.filter((entry) => {
        const entryDate = new Date(entry.createdAt);
        return (
          entryDate.getDate() === currentDate.getDate() &&
          entryDate.getMonth() === currentDate.getMonth() &&
          entryDate.getFullYear() === currentDate.getFullYear()
        );
      });

      result.push({
        timeframe: `${await this.getOrdinalSuffix(currentDate.getDate())}`,
        date: currentDate.toDateString(),
        traffic: dailyTraffic.length,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return this.success(res, '--shopTraffic/successful', 'Store traffic found for the last 30 days', 200, result);
  }

  async getShopTrafficForLast7Days(req: Request, res: Response) {
    const { shop_id } = req.params;

    const endDate = new Date(); // Set end date to the current date
    endDate.setHours(23, 59, 59, 999); // Set end date to the end of the day

    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 6); // Set start date to 6 days ago

    const shopTraffic = await prisma.store_traffic.findMany({
      where: {
        shop_id: shop_id,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const result = [];

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const currentDate = new Date(startDate);
    for (let i = 0; i < 7; i++) {
      const dailyTraffic = shopTraffic.filter((entry) => {
        const entryDate = new Date(entry.createdAt);
        return (
          entryDate.getDate() === currentDate.getDate() &&
          entryDate.getMonth() === currentDate.getMonth() &&
          entryDate.getFullYear() === currentDate.getFullYear()
        );
      });

      result.push({
        timeframe: daysOfWeek[currentDate.getDay()],
        date: currentDate.toDateString(),
        traffic: dailyTraffic.length,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return this.success(res, '--shopTraffic/successful', 'Store traffic found for the last 7 days', 200, result);
  }

  async getShopTrafficForLast24Hours(req: Request, res: Response) {
    const { shop_id } = req.params;

    const currentDate = new Date();
    const result = [];

    for (let i = 0; i < 24; i++) {
      const startDate = new Date(currentDate);
      startDate.setHours(currentDate.getHours() - (i + 1)); // Subtracting i+1 hours to get data for each past hour
      const endDate = new Date(startDate);
      endDate.setHours(startDate.getHours() + 1); // Setting endDate to the next hour

      const shopTraffic = await prisma.store_traffic.findMany({
        where: {
          shop_id: shop_id,
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
        },
      });
      // Format the hour in am/pm format
      const hour = (startDate.getHours() % 12 || 12) + (startDate.getHours() >= 12 ? 'pm' : 'am');

      result.push({
        // timeframe: startDate.toLocaleString(),
        // storeTraffic: shopTraffic.length,

        timeframe: hour,
        date: startDate.toDateString(),
        time: startDate.toLocaleTimeString(),
        traffic: shopTraffic.length,
      });
    }

    result.reverse(); // Reverse the array to get results from oldest to newest

    return this.success(res, '--shopTraffic/successful', 'Store traffic found for the last 24 hours', 200, result);
  }
}
