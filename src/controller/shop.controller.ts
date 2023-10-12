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

  async shopTraffic(req: Request, res: Response) {
    // const { shop_id } = req.body;
    // const traffic = {
    //   shop_id,
    //   ip_addr: req.socket.remoteAddress,
    // }
  
    req.body.ip_addr = req.socket.remoteAddress;
    console.log(req.body)

    const { error, value } = createShopTrafficSchema.validate(req.body);

    if (error) {
      return this.error(res, '--shop/store-traffic', error?.message ?? 'missing required field.', 400, null);
    }

    await prisma.store_traffic.create(req.body);

    this.success(res, '--shop/store-traffic', 'traffic added', 200, null);
  }
}
