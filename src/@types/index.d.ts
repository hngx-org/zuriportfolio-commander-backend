import { Router } from 'express';

export interface Routes {
  path: string;
  router: Router;
}

export interface AddProductPayloadType {
  name: string;
  description: string;
  quantity: number;
  price: number;
  discountPrice: number;
  tax: number;
  currency: string;
  category: string;
  shopId: string;
}
