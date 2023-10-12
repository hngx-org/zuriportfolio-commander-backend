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

export interface AuthenticatedMiddleware {
  status: number;
  authorized: boolean;
  message: string;
  user: { id: string };
}
