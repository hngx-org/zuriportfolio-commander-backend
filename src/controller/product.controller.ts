import { Request, Response } from 'express';
import BaseController from './base.controller';
import { productSchema } from '../helper/validate';
import { uploadSingleImage } from '../helper/uploadImage';
import logger from '../config/logger';
import { AddProductPayloadType } from '@types';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/prisma';
import { isUUID } from '../helper';



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
      return this.error(res, '--product/not-found', 'Product not found', 404);
    }

    // Update the is_published field to true
    await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        is_published: true,
      },
    });

    this.success(res, '--publish/success', 'Product published successfully', 201);
  }

  async addProduct(req: Request, res: Response) {
    const file = req.file ?? null;
    const payload: AddProductPayloadType = JSON.parse(req.body.json);

    const { error, value } = productSchema.validate(payload);
    if (error || !file) {
      return this.error(res, '--product/invalid-fields', error?.message ?? 'product image is missing.', 400, null);
    }
    // upload image to cloudinary
    const { name, currency, userId, description, discountPrice, price, quantity, tax, category, shopId } = payload;
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

    // check if user exists

    const placeHolderImg = image ?? 'https://placehold.co/600x400/EEE/31343C?text=placeholder';
    const product = await prisma.product.create({
      data: {
        id: uuidv4(),
        name,
        shop_id: shopId,
        user_id: userId,
        currency,
        description,
        discount_price: discountPrice ?? 0,
        quantity,
        price,
        tax: tax ?? 0,
        image: {
          create: {
            url: placeHolderImg,
          },
        },
      },
      include: { image: true },
    });

    this.success(res, 'Product Added', 'Product has been added successfully', 201, {
      ...product,
      // image: product.image,
    });
  }

  async addProductDraft(req: Request, res: Response) {
    const file = req.file ?? null;
    const product_id = req.params['productId'];
    const payload: AddProductPayloadType = JSON.parse(req.body.json);

    const { error, value } = productSchema.validate(payload);
    if (error || typeof product_id === 'undefined') {
      return this.error(
        res,
        '--product/invalid-fields',
        error?.message ?? 'Important product details is missing.',
        400,
        null
      );
    }

    // upload image to cloudinary
    const { name, currency, description, discountPrice, price, quantity, tax, category, shopId, userId } = payload;
    const { isError, errorMsg, image } = await uploadSingleImage(file);

    if (isError) {
      logger.error(`Error uploading image: ${errorMsg}`);
    }

    // check if product exists
    const prodExists = await prisma.product.findFirst({ where: { id: product_id } });

    const placeHolderImg = image ?? 'https://placehold.co/600x400/EEE/31343C?text=placeholder';

    if (!prodExists) {
      await prisma.product.create({
        data: {
          id: product_id,
          name,
          shop_id: shopId,
          user_id: userId,
          currency,
          description,
          discount_price: discountPrice ?? 0,
          quantity,
          price,
          tax: tax ?? 0,
          image: {
            create: {
              url: placeHolderImg,
            },
          },
        },
      });
    } else {
      await prisma.product.update({
        where: {
          id: product_id,
        },
        data: {
          id: product_id,
          name,
          shop_id: shopId,
          user_id: userId,
          currency,
          description,
          discount_price: discountPrice ?? 0,
          quantity,
          price,
          tax: tax ?? 0,
          image: {
            create: {
              url: placeHolderImg,
            },
          },
        },
      });
    }

    this.success(res, '--product/save-as-draft', 'Product updated and saved as draft', 201);
  }

  async unpublishProduct(req: Request, res: Response) {
    const productId = req.params.productId;

    //check if product exists
    const prodExists = await prisma.product.findFirst({ where: { id: productId } });

    if (!prodExists) {
      return this.error(res, '--product/notfound', 'Failed to unpublish, product not found', 404);
    }

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

  async getAllProducts(req: Request, res: Response) {
    const userId = (req as any).user?.id;

    const products = await prisma.product.findMany({
      where: {
        user_id: userId,
      },
    });
    return this.success(res, 'All Products Shown', 'Products have been listed', 200, products);
  }

  async deleteProduct(req: Request, res: Response) {
    const productId = req.params['product_id'];
    const userId = (req as any).user['id'];

    if (typeof productId === 'undefined') {
      return this.error(res, '--product_delete/invalid-fields', 'Invalid field provided.', 400);
    }

    // check if field parameter is a uuid
    if (!isUUID(productId)) {
      return this.error(
        res,
        '--product_delete/invalid-field',
        'product id is invalid, expected product_id in uuid format.',
        400
      );
    }

    // Check if the product exists before attempting to delete it
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        user_id: userId,
      },
    });

    if (!product) {
      return this.error(res, '--product_delete/product-notfound', 'Product not found', 404);
    }

    // If the product exists, proceed with deletion
    await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        is_deleted: 'temporary',
      },
    });

    return this.success(res, '--product_delete/success', 'Product has been deleted successfully', 200);
  }
  async getAllCategories(req: Request | any, res: Response | any) {
    try {
      const categories = await prisma.product_category.findMany({
        include: {
          sub_categories: true,
        },
      });
      this.success(res, '--categories/all', 'categories fetched successfully', 200, categories);
    } catch (error) {
      return this.error(res, '--orders/internal-server-error', 'Internal server Error', 500);
    }
  }

  async getOrderByProductName(req: Request | any, res: Response | any) {
    const { name } = req.params;
    const { page = 1, pageSize = 10 } = req.query;
    try {
      const orderItems = await prisma.order_item.findMany({
        include: {
          product: true,
        },
        where: {
          product: {
            name: {
              contains: name,
              mode: 'insensitive', // Case-insensitive search
            },
          },
        },
        skip: (+page - 1) * +pageSize,
        take: +pageSize,
      });

      this.success(res, '--orders/all', 'orders fetched successfully', 200, orderItems);
    } catch (error) {
      return this.error(res, '--orders/internal-server-error', 'Internal server Error', 500);
    }
  }
}
