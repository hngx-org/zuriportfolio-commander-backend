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

export interface AddPromotionPayloadType {
  user_id: string;
  promotion_type: string;
  discount_type: string;
  quantity: number;
  amount: number;
  product_id: string;
  min_cart_price: number
}
// export interface AuthenticatedMiddleware {
//   status: number;
//   authorized: boolean;
//   message: string;
//   user: { id: string };
// }
