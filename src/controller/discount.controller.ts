import { Request, Response } from 'express';
import BaseController from './base.controller';
import prisma from '../config/prisma';
import shortUUID from 'short-uuid';

export default class DiscountController extends BaseController {
  constructor() {
    super();
  }
  async createDiscount(req: Request, res: Response) {
    const {
      id,
      user_id,
      promotion_type,
      discount_type,
      quantity,
      amount,
      product_id,
      valid_from,
      valid_to,
      min_cart_price,
    } = req.body;
    const createdDiscount = await prisma.promotion.create({
      data: {
        id: shortUUID.generate(),
        user_id: user_id,
        promotion_type: promotion_type,
        discount_type: discount_type,
        quantity: quantity,
        amount: amount,
        product_id: product_id,
        valid_from: valid_from,
        valid_to: valid_to,
        min_cart_price: min_cart_price,
      },
    });
    this.success(res, 'user created discount', 'Discount created successfully', 200, createdDiscount);
  }

  async getAllDiscount(req: Request, res: Response) {
    const userId = req.params.id; // get the user id from the request params

    if (!userId) {
      this.error(res, '--discount/all', 'This user id does not exist', 400, 'user not found');
    }

    const discount = await prisma.promotion.findMany({
      where: {
        id: userId,
      },
    });

    this.success(res, '--discount/all', 'discount fetched successfully', 200, discount);
  }
}
