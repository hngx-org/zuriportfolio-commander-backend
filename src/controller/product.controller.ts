import { Request, Response } from 'express';
import BaseController from './base.controller';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default class ProductController extends BaseController {
  constructor() {
    super();
  }

  async unpublishProduct(req: Request, res: Response) {
    const productId = req.params.product_id;
    const userdata = await prisma.product.update({
      where: {
        id: productId
      },
      data: {
        isPublished: false
      }
    })
    this.success(
      res, 
      '--user/fake-data', 
      'user data fetched successfully', 
      200, 
      userdata);

    // console.log(req);
  }

  
}


