import Joi from 'joi';

const customUUIDPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export const productSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  // quantity: Joi.number().min(1).optional().default(1),
  price: Joi.number().required(),
  discountPrice: Joi.number().min(0).optional().default(0),
  tax: Joi.number().optional(),
  currency: Joi.string().required(),
  sub_category_id: Joi.number().optional(),
  assets_name: Joi.string().required(),
  assets_link: Joi.string().required(),
  assets_notes: Joi.string().optional(),
  assets_type: Joi.string().valid('external', 'internal').required(),
});

export const productSubcategoriesSchema = Joi.array().items(Joi.number()).required();

export const saleSchema = Joi.object({
  user_id: Joi.string().required(),
  sales: Joi.number().required(),
  order_id: Joi.string().required(),
});

export const updatedProductSchema = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().optional(),
  quantity: Joi.number().integer().optional(),
  price: Joi.number().optional(),
  discountPrice: Joi.number().optional(),
  tax: Joi.number().optional(),
  currency: Joi.string().optional(),
  sub_category_id: Joi.number().optional(),
});

export const updateProductAssets = Joi.object({
  name: Joi.string().optional(),
  link: Joi.string().optional(),
  notes: Joi.string().optional(),
  type: Joi.string().valid('external', 'internal').optional(),
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
  parent_id: Joi.alternatives(Joi.number().integer(), Joi.allow(null), Joi.allow('')).optional(),
});

export const createSubCategorySchema = Joi.object({
  name: Joi.string().required(),
  parent_id: Joi.number().required(),
});

export const addProductCategorySchema = Joi.object({
  name: Joi.string().required(),
  user_id: Joi.string().required(),
});

export const createDiscountSchema = Joi.object({
  discount_type: Joi.string().required(),
  amount: Joi.number().required(),
  maximum_discount_price: Joi.number().default(0).optional(),
  quantity: Joi.number().default(1).optional(),
  product_ids: Joi.array()
    .items(Joi.string().pattern(customUUIDPattern))
    .messages({
      'string.pattern.base': 'product_id has an invalid uuid.',
    })
    .required(),
  valid_from: Joi.date().required(),
  valid_to: Joi.date().required(),
});

export const updatedDiscountSchema = Joi.object({
  discount_type: Joi.string().optional(),
  amount: Joi.number().optional(),
  code: Joi.string().optional(),
  quantity: Joi.number().min(1).optional(),
  maximum_discount_price: Joi.number().optional(),
  product_ids: Joi.array()
    .items(Joi.string().pattern(customUUIDPattern))
    .messages({
      'string.pattern.base': 'product_id has an invalid uuid.',
    })
    .optional(),
  valid_from: Joi.date().optional(),
  valid_to: Joi.date().optional(),
});

export const trackPromotionSchema = Joi.object({
  promo_id: Joi.number().required(),
  productId: Joi.string().required(),
  merchant_id: Joi.string().required(),
});

export const createShopTrafficSchema = Joi.object({
  shop_id: Joi.string().required(),
  ip_addr: Joi.string().required(),
});

export const validateUUID = Joi.string()
  .pattern(customUUIDPattern)
  .messages({
    'string.pattern.base': 'invalid uuid format.',
  })
  .required();

export const createActivitySchema = Joi.object({
  action: Joi.string().required(),
  title: Joi.string().required(),
  description: Joi.string().required(),
});
