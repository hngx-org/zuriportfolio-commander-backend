import { Request, Response } from 'express';
import BaseController from './base.controller';
<<<<<<< HEAD
import { PrismaClient } from '@prisma/client';
=======
import { PrismaClient } from "@prisma/client";
>>>>>>> 86789cf5f5f3e62e8f1d069a0016a5847087bf0f

const prisma = new PrismaClient();

export default class CreateDiscountController extends BaseController {
  constructor() {
    super();
  }
  async createDiscount(req: Request, res: Response) {
    const {
      id,
<<<<<<< HEAD
      user_id,
=======
    user_id,
>>>>>>> 86789cf5f5f3e62e8f1d069a0016a5847087bf0f
      promotion_type,
      discount_type,
      quantity,
      amount,
      product_id,
      valid_from,
      valid_to,
<<<<<<< HEAD
      min_cart_price,
    } = req.body;
    const createdDiscount = await prisma.promotion.create({
      data: {
        id: id,
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
}
=======
      min_cart_price
    
    } = req.body;
    const createdDiscount = await prisma.promotion.create({
      data: {
        id : id,
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
>>>>>>> 86789cf5f5f3e62e8f1d069a0016a5847087bf0f
