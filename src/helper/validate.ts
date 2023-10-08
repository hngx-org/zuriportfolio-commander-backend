import Joi from 'joi';

export const productSchema = Joi.object({
  userId: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().required(),
  quantity: Joi.number().integer().required(),
  price: Joi.number().required(),
  discountPrice: Joi.number(),
  tax: Joi.number(),
  currency: Joi.string().required(),
});
