import { Request, Response } from 'express';
import BaseController from './base.controller';
import prisma from '../config/prisma';
import { Discount_type } from '@prisma/client';

export default class GetAllDiscountController extends BaseController {
  constructor() {
    super();
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
