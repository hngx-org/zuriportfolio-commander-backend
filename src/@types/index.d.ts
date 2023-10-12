import { Router } from 'express';

export interface Routes {
  path: string;
  router: Router;
}

export interface AddProductPayloadType {
  product_id?: string;
  name: string;
  description: string;
  quantity: string;
  price: string;
  discountPrice: string;
  tax: string;
  currency: string;
  categoryId: string;
  shopId: string;
  userId: string; //! remove this once auth is working
}

export interface AddSalesReportType {
  user_id: string;
  sales: number;
  order_id: string;
}

export interface AddPromotionPayloadType {
  user_id: string;
  promotion_type: string;
  discount_type: string;
  quantity: number;
  amount: number;
  product_id: string;
  min_cart_price: number;
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
