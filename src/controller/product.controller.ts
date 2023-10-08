import { Request, Response } from "express";
import BaseController from "./base.controller";
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()


export default class ProductController extends BaseController {
  constructor() {
      super();
  }

  async unpublishProduct(req: Request, res: Response) {
    
    
    
    
    
    
    //   const productId = req.params.id;

      const product = await prisma.product.create({
        data: {
            name: "Test Product 1",
            description: "This describes the 1st test product",
            quantity: 20000,
            category: 12,
            image_id: 1010110,
            price: 1234.56,
            discount_price: 78.90,
            tax: 12.34,
            rating_id: 123,
            currency: "NGN",
        }
      })

      console.log(product)
  }



}

// export { ProductController };