import Joi from 'joi';

const customUUIDPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export const productSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  quantity: Joi.number().integer().required(),
  price: Joi.number().required(),
  discountPrice: Joi.number().optional(),
  tax: Joi.number().optional(),
  currency: Joi.string().required(),
  categoryId: Joi.number().required(),
});

export const saveProductDraftSchema = Joi.object({
  product_id: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().required(),
  quantity: Joi.number().integer().required(),
  price: Joi.number().required(),
  discountPrice: Joi.optional(),
  tax: Joi.optional(),
  currency: Joi.string().required(),
  category: Joi.string().required(),
  shopId: Joi.string().required(), // once auth is done, remove this
  userId: Joi.string().required(), // same as this.
});

export const createShopSchema = Joi.object({
  name: Joi.string().required(),
});

export const createCategorySchema = Joi.object({
  name: Joi.string().required(),
  // parent_id: Joi.number().integer().allow(null).optional(),
  parent_id: Joi.alternatives(
    Joi.number().integer(),
    Joi.allow(null),
    Joi.allow(undefined),
    Joi.allow('')
  ).optional(),
});

export const createDiscountSchema = Joi.object({
  discount_type: Joi.string().required(),
  amount: Joi.number().required(),
  quantity: Joi.number().min(1).required(),
  maximum_discount_price: Joi.number().optional(),
  product_ids: Joi.array()
    .items(Joi.string().pattern(customUUIDPattern))
    .messages({
      'string.pattern.base': 'product_id has an invalid uuid.',
    })
    .required(),
  valid_from: Joi.date().required(),
  valid_to: Joi.date().required(),
});

export const trackPromotionSchema = Joi.object({
  promo_id: Joi.string().required(),
  sales: Joi.string().required(),
});
