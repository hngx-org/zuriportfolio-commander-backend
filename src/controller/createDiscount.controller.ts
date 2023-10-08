import { Request, Response } from 'express';
import BaseController from './base.controller';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default class CreateDiscountController extends BaseController {
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
      min_cart_price
    
    } = req.body;
    const createdDiscount = await prisma.promotion.create({
      data: {
        id : "123",
        user_id : user_id,
        promotion_type: promotion_type,
        discount_type : discount_type,
        quantity: quantity,
        amount: amount,
        product_id : product_id,
        valid_from : valid_from,
        valid_to : valid_to,
        min_cart_price: min_cart_price
      },
    });
    this.success(
      res,
      "user created discount",
      "Discount created successfully",
      200,
      createdDiscount
    );
  
  
  }
}
