import Joi from 'joi';

export const productSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  quantity: Joi.number().integer().required(),
  price: Joi.number().required(),
  discountPrice: Joi.optional(),
  tax: Joi.optional(),
  currency: Joi.string().required(),
  category_id: Joi.string().required(),
  shopId: Joi.string().required(), // once auth is done, remove this
  userId: Joi.string().required(), // same as this.
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
  merchant_id: Joi.string().required(),
});

export const promotionSchema = Joi.object({
  user_id: Joi.string().required(),
  promotion_type: Joi.string().required(),
  discount_type: Joi.string().required(),
  quantity: Joi.number().integer().required(),
  amount: Joi.number().integer().required(),
  product_id: Joi.string().required(),
  min_cart_price: Joi.number().integer().required(),
});
