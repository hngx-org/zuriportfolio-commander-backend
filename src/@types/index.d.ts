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


declare module 'express-serve-static-core' {
  export interface Request {
    user: {
      id: string; // You can define the properties you need here
      // Add any other user properties you want to access
    };
  }
}

