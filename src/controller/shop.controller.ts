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

  async updateShop(req: Request, res: Response) {
    // TODO: Fetch the shop id from req.params
    const shopId = req.params.shop_id;

    // TODO: Set the allowed fields to be updated
    const allowedFields = ['name', 'policy_confirmation', 'restricted', 'admin_status', 'reviewed'];

    const shop = await prisma.shop.findUnique({
      where: {
        id: shopId,
      },
    });

    if (!shop) {
      return this.error(res, '--shop/updateshop', 'shop not found', 404);
    }

    // check if fields are empty
    if (Object.keys(req.body).length === 0) {
      return this.error(res, '--shop/updateshop', 'no fields to update', 400);
    }

    // check if updates are allowed
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((update) => allowedFields.includes(update));
    if (!isValidOperation) {
      return this.error(res, '--shop/updateshop', 'invalid field(s)', 400);
    }

    // loop through the fields to be updated
    for (const field in req.body) {
      if (allowedFields.includes(field)) {
        shop[field] = req.body[field];
      }
    }

    // update shop
    const updatedShop = await prisma.shop.update({
      where: {
        id: shopId,
      },
      data: {
        ...shop,
      },
    });

    this.success(res, '--shop/updateshop', 'shop updated successfully', 200, updatedShop);
  }
}
