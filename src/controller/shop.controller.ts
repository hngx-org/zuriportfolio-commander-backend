import { Request, Response } from 'express';
import BaseController from './base.controller';
import { createShopSchema, productSchema } from '../helper/validate';
import logger from '../config/logger';
import { AddProductPayloadType } from '@types';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/prisma';

export default class ShopController extends BaseController {
  constructor() {
    super();
  }

  async createShop(req: Request, res: Response) {
    const payload = req.body;
    const { error, value } = createShopSchema.validate(payload);
    if (error) {
      return this.error(res, '--shop/invalid-fields', error?.message ?? 'missing shop details.', 400, null);
    }

    const { name, merchant_id } = payload;
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

  async getAllShops(res: Response): Promise<void> {
    try {
      const shops = await prisma.shop.findMany();
      if (shops.length > 0) {
        this.success(res, 'All Shops Shown', 'Shops have been listed', 200, shops);
      } else {
        this.error(res, '--shops-notfound', 'Shops not found', 404);
      }
    } catch (error) {
      console.error('Error:', error);
      this.error(res, '--internal-error', 'Internal server error', 500);
    }
  }
}
