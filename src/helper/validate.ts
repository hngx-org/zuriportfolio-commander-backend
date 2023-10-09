import Joi from 'joi';

export const productSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  quantity: Joi.number().integer().required(),
  price: Joi.number().required(),
  discountPrice: Joi.optional(),
  tax: Joi.optional(),
  currency: Joi.string().required(),
  category: Joi.string().required(),
  shopId: Joi.string().required(),
});
