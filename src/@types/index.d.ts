import { Router } from 'express';

export interface Routes {
  path: string;
  router: Router;
}

export interface AddProductPayloadType {
  product_id?: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  discountPrice: number;
  tax: number;
  currency: string;
  category: string;
  shopId: string;
  userId: string; //! remove this once auth is working
}

export interface AuthenticatedMiddleware {
  status: number;
  authorized: boolean;
  message: string;
  user: { id: string };
}

export interface CreateDiscountType {
  discount_type: string;
  amount: number;
  quantity: number;
  maximum_discount_price: number;
  product_ids: string[];
  valid_from: string;
  valid_to: string;
}
