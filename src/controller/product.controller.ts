import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import BaseController from './base.controller';
import { productSchema } from '../helper/validate';
import { uploadSingleImage } from '../helper/uploadImage';
import logger from '../config/logger';
import { AddProductPayloadType } from '@types';
import shortUUID from 'short-uuid';

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
        is_published: true,
      },
    });

    const payload = {
      message: 'Product published successfully',
      statusCode: 200,
      data: updatedProduct,
    };

    this.success(res, '--publish/success', payload.message, payload.statusCode, payload.data);
  }

  async addProduct(req: Request, res: Response) {
    const file = req.file ?? null;
    const payload: AddProductPayloadType = JSON.parse(req.body.json);

    const { error, value } = productSchema.validate(payload);
    if (error || !file) {
      return this.error(res, '--product/invalid-fields', error?.message ?? 'product image is missing.', 400, null);
    }
    // upload image to cloudinary
    const { name, currency, description, discountPrice, price, quantity, tax, category, shopId } = payload;
    const { isError, errorMsg, image } = await uploadSingleImage(file);

    if (isError) {
      logger.error(`Error uploading image: ${errorMsg}`);
    }

    // check if user has a shop
    const shopExists = await prisma.shop.findFirst({
      where: {
        id: shopId,
      },
    });

    if (!shopExists) {
      return this.error(res, '--product/shop-notfound', 'Failed to crete product, shop not found.', 404);
    }

    const placeHolderImg = image ?? 'https://placehold.co/600x400/EEE/31343C?text=placeholder';
    const product = await prisma.product.create({
      data: {
        id: shortUUID.generate(),
        name,
        shop_id: 'sdcsdcsdc',
        user_id: 'sdcsdcsdc',
        currency,
        description,
        discount_price: discountPrice ?? 0,
        quantity,
        price,
        tax: tax ?? 0,
        categories: {
          create: {
            name: category,
          },
        },
        image: {
          create: {
            url: placeHolderImg,
          },
        },
      },
    });

    this.success(res, 'Product Added', 'Product has been added successfully', 201, product);
  }

  async addProductDraft(req: Request, res: Response) {
    // Validates product details
    const { error, value } = productSchema.validate(req.body);

    // returns error in case of wroong user details
    if (error) {
      return this.error(res, 'Validation Error', error.details[0].message, 400, null);
    }

    // creates new product as draft
    const product = await prisma.product.create({
      data: {
        ...value,
        isPublished: false,
      },
    });

    this.success(res, 'Product Added', 'Product has been added as Draft', 201, product);
  }

  async unpublishProduct(req: Request, res: Response) {
    const productId = req.params.productId;
    // Update the is_published field to false
    const updatedProduct = await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        is_published: false,
      },
    });

    this.success(res, 'Product Unpublished', 'Product has been unpublished successfully', 201, updatedProduct);
  }
}
