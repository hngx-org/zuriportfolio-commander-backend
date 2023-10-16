import { Request, Response } from 'express';
import BaseController from './base.controller';
import { createShopSchema, productSchema, createShopTrafficSchema } from '../helper/validate';
import logger from '../config/logger';
import { AddProductPayloadType } from '@types';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/prisma';
import { TestUserId } from '../config/test';

export default class ShopController extends BaseController {
  constructor() {
    super();
  }

  async createShop(req: Request, res: Response) {
    const TestUserId = '02cac250-ccbf-409f-9c67-ecbbdb5bc31e';
    const merchant_id = (req as any).user?.id ?? TestUserId;
    const { error } = createShopSchema.validate(req.body);
    if (error) {
      return this.error(res, '--shop/invalid-fields', error?.message ?? 'missing shop details.', 400, null);
    }
    const { name } = req.body;
    const id = uuidv4();

    const userExists = await prisma.user.findFirst({
      where: { id: merchant_id },
    });

    if (!userExists) {
      return this.error(res, '--shop/merchant-notfound', 'merchant not find', 404);
    }

    const shop = await prisma.shop.create({
      data: {
        id,
        name,
        merchant_id,
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

    const { error, value } = createShopTrafficSchema.validate(data);

    if (error) {
      return this.error(res, '--shop/store-traffic', error?.message ?? 'missing required field.', 400, null);
    }

    await prisma.store_traffic.create({ data });

    this.success(res, '--shop/store-traffic', 'traffic added', 200, null);
  } // end of shop traffic

  // Fetch the shop by its ID
  async getShopId(req: Request, res: Response) {
    const shopId = req.params.shop_id;

    // Fetch the shop associated with the merchant, including all its products
    const shop = await prisma.shop.findMany({
      where: {
        AND: {
          id:shopId,
          is_deleted: 'active',
        },
      },
      include: {
        products: true,
      },
    });

    if (!shop) {
      return this.error(res, '--shop/missing-shop', 'Shop not found.', 404, null);
    }

    return this.success(
      res,
      `Shop and Products for Merchant ${shopId} Shown`,
      'Shop and its products retrieved successfully',
      200,
      shop
    );
  }
}
