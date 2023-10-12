import { Request, Response } from 'express';
import BaseController from './base.controller';
import { createShopSchema, productSchema } from '../helper/validate';
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
    const payload = req.body;
    const merchant_id = (req as any).user?.id ?? TestUserId;
    const { error, value } = createShopSchema.validate(payload);
    if (error) {
      return this.error(res, '--shop/invalid-fields', error?.message ?? 'missing shop details.', 400, null);
    }
    const { name } = payload;
    const id = uuidv4();

    //! check if user exists
    const userExists = await prisma.user.findFirst({
      where: { id: merchant_id },
    });

    if (!userExists) {
      return this.error(res, '--shop/merchant-notfound', 'merchant not find', 404);
    }

    // create shop
    const created = await prisma.shop.create({
      data: {
        id,
        name,
        merchant_id,
      },
    });

    this.success(res, '--shop/created', 'shop created', 200, created);
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

  async getAllShops(req: Request, res: Response) {
    const shops = await prisma.shop.findMany();
    if (shops.length > 0) {
      this.success(res, 'All shops', 'Shops have been listed successfully', 200, shops);
    } else {
      this.error(res, '--shops-notfound', 'Shops not found', 404);
    }
  }
}
