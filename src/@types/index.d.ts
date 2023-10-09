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
