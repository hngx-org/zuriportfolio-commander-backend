import { Request, Response } from 'express';
import BaseController from './base.controller';
import { AddPromotionPayloadType } from '@types';
import prisma from '../config/prisma';
import { v4 as uuidv4 } from 'uuid';
import { createDiscountSchema } from '../helper/validate';
import { CreateDiscountType } from '../@types';
import { genRandNum, validateDateRange } from '../helper';
import logger from '../config/logger';
import { TestUserId } from '../config/test';

export default class DiscountController extends BaseController {
  constructor() {
    super();
  }

  private async canAddPromoToProducts(productIds: string[], userId: string) {
    const canAddPromo = [];

    for (const productId of productIds) {
      const product = await prisma.product.findUnique({
        where: { id: productId, user_id: userId },
        include: {
          promo_product: true,
          // You can also include other related tables if needed, like discounts
        },
      });

      if (product) {
        if (product.promo_product.length > 0) {
          // The product is associated with at least one promo
          canAddPromo.push({ productId, canAdd: false });
        }
      }
    }

    return canAddPromo as [{ productId: string; canAdd: boolean }];
  }

  async createDiscount(req: Request, res: Response) {
    const userId = (req as any).user?.id ?? TestUserId;
    // const userId = 'dcb5b46a-9391-474c-9e69-fe37cfe821e9';
    const validateSchema = createDiscountSchema.validate(req.body);
    if (validateSchema.error) {
      return this.error(res, '--discount/invalid-fields', validateSchema.error.message, 400);
    }

    const { amount, discount_type, maximum_discount_price, product_ids, quantity, valid_from, valid_to } =
      req.body as CreateDiscountType;
    const validDiscountType = ['percentage', 'fixed'];
    const validDiscountEnum = {
      percentage: 'Percentage',
      fixed: 'Fixed',
    };

    // verify date range
    const { error, msg } = validateDateRange(valid_from, valid_to);

    if (error) {
      return this.error(res, '--discount/invalid-date-range', msg, 400);
    }

    if (!validDiscountType.includes(discount_type.toLowerCase())) {
      return this.error(res, '--discount/invalid-discount-type', 'Invalid discount type', 400);
    }

    // validate products
    const notFoundProd = [];
    if (product_ids.length > 0) {
      for (let i = 0; i < product_ids.length; i++) {
        const pId = product_ids[i];
        const exist = await prisma.product.findFirst({
          where: {
            AND: {
              id: pId,
              user_id: userId,
              is_deleted: 'active',
            },
          },
        });
        if (exist === null) {
          notFoundProd.push(pId);
        }
      }
    }

    if (notFoundProd.length > 0) {
      logger.error(`One of this product dont exists: ${notFoundProd.join(' ')}`);
      return this.error(res, '--discount/product-notfound', `One or more of the product dont exist`, 400);
    }

    // make sure product added has no discount / promo
    if (product_ids.length > 0) {
      const result = await this.canAddPromoToProducts(product_ids, userId);
      console.log(result);
      if (result.length > 0) {
        logger.error(`One of this product already has a promo: ${notFoundProd.join(' ')}`);
        return this.error(res, '--discount/promo-exist', `One or more of the product already has a promo.`, 400);
      }
    }

    // create promotion
    const promo_id = genRandNum(5);
    let createdProdDiscount;

    const createPromo = prisma.promotion.create({
      data: {
        id: promo_id,
        user_id: userId,
        discount_type: validDiscountEnum[discount_type.toLowerCase()],
        quantity,
        amount,
        maximum_discount_price,
        valid_from,
        valid_to,
        promotion_type: 'Discount',
        code: uuidv4(), // remember to remove this
      },
    });

    if (product_ids.length > 0) {
      // cretate the promo product
      for (const pId of product_ids) {
        createdProdDiscount = prisma.promo_product.create({
          data: {
            promo_id,
            product_id: pId,
            user_id: userId,
          },
        });
      }
    }

    const [promo, discount] = await prisma.$transaction([createPromo, createdProdDiscount]);

    this.success(res, '--discount/success', `Successfully created discount`, 201, {
      promo: promo,
      productWithPromo: discount ?? null,
    });
  }

  async trackDiscount(req: Request, res: Response) {
    const userId = (req as any).user?.id ?? TestUserId;
    // const userId = 'dcb5b46a-9391-474c-9e69-fe37cfe821e9';
    const validateSchema = createDiscountSchema.validate(req.body);
    if (validateSchema.error) {
      return this.error(res, '--discount/invalid-fields', validateSchema.error.message, 400);
    }

    // check if
  }

  async computePromoUsage(prodId: string, promoId: number, userId: string) {
    const trackPromos = await prisma.track_promotion.findMany({
      where: {
        AND: {
          promo_id: promoId,
          product_id: prodId,
          user_id: userId,
        },
      },
    });
    return trackPromos.length;
  }

  async isPromoExpired(promoId: number) {
    const currentDate = new Date();
    const promo = await prisma.promotion.findFirst({
      where: { id: promoId },
    });

    console.log(promo);

    if (promo === null) return true;

    const { valid_from, valid_to } = promo;
    const validFrom = new Date(valid_from);
    const validTo = new Date(valid_to);

    // Check if the current date is within the valid date range
    if (currentDate >= validFrom && currentDate <= validTo) {
      return true;
    } else if (currentDate >= validTo) {
      return true;
    } else {
      return false;
    }
  }

  async getAllDiscount(req: Request, res: Response) {
    const userId = (req as any).user?.id ?? TestUserId;
    const allPromotions = [];

    const promos = await prisma.promotion.findMany({
      where: {
        user_id: userId,
      },
      include: { promo_product: true, tracked_promo: true },
    });

    for (const promo of promos) {
      const promoProd = await prisma.promo_product.findMany({ where: { promo_id: promo.id } });
      const prodIds = promoProd.map((d) => d.product_id);

      for (const id of prodIds) {
        const pInfo = await prisma.product.findFirst({
          where: { id },
        });

        allPromotions.push({
          name: pInfo.name,
          quantity: promo.quantity,
          type: promo.discount_type,
          discount_price: promo.amount,
          status: (await this.isPromoExpired(promo.id)) ? 'Expired' : 'Active', // check exp
          usage: await this.computePromoUsage(id, promo.id, userId),
        });
      }
    }

    this.success(res, '--discount/all', 'discount fetched successfully', 200, allPromotions);
  }

  async getAllPromotionsWithTrackedPromotions(req: Request, res: Response) {
    const userId = (req as any).user?.id ?? TestUserId;

    if (!userId) {
      return this.error(res, '--discount/promotions', 'User not found', 404, 'User not found');
    }

    // query parameters for pagination
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const itemsPerPage = req.query.itemsPerPage ? parseInt(req.query.itemsPerPage as string, 10) : 10;

    // Calculate the offset to skip the appropriate number of items
    const offset = (page - 1) * itemsPerPage;

    // Fetch all associated products for promotions created by the user
    const promoProducts = await prisma.promo_product.findMany({
      where: {
        user_id: userId,
      },
      include: {
        product: true, // Include all product information
        promo: {
          include: {
            tracked_promo: true, // Include tracked promotions for each promotion
          },
        },
      },
      orderBy: {
        product: {
          name: 'asc', // Sort products alphabetically
        },
      },
      skip: offset,
      take: itemsPerPage,
    });

    // Prepare an array to store the results
    const productsWithPromotionsAndTrackedCounts = [];

    for (const promoProduct of promoProducts) {
      const { product, promo } = promoProduct;
      const sales = promo.tracked_promo.length;

      productsWithPromotionsAndTrackedCounts.push({
        product,
        promo,
        sales,
      });
    }

    if (productsWithPromotionsAndTrackedCounts.length === 0) {
      return this.success(res, '--discount/promotions', 'No promotions found', 200, []);
    } else {
      return this.success(
        res,
        '--discount/promotions',
        'Products with promotions and tracked promotions fetched successfully',
        200,
        productsWithPromotionsAndTrackedCounts
      );
    }
  }
}
