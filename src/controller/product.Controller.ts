import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import BaseController from './base.controller'; // Assuming you have a BaseController

const prisma = new PrismaClient();

export default class ProductController extends BaseController {
  constructor() {
    super();
  }

  async publishProduct(req: Request, res: Response) {
    const productId = req.params.productId;

    // Find the product by ID
    const existingProduct = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    // Check if the product exists
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Update the is_published field to true
    const updatedProduct = await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        isPublished: true,
      },
    });

    const payload = {
      message: 'Product published successfully',
      statusCode: 200,
      data: updatedProduct,
    };

    this.success(res, "--publish/success", payload.message, payload.statusCode,payload.data);
  }
}
