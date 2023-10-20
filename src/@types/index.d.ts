import { ObjectEnumValue } from '@prisma/client/runtime/library';
import { Router } from 'express';

export interface Routes {
  path: string;
  router: Router;
}

export interface AddProductPayloadType {
  name: string;
  description: string;
  quantity?: number;
  price: string;
  discountPrice?: string;
  tax: string;
  currency: string;
  sub_category_id: never;
  assets_name: string;
  assets_link: string;
  assets_notes: string;
  assets_type: 'external' | 'internal';
}

export interface TrackPromo {
  promo_id: number;
  productId: string;
  merchant_id: string;
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
  maximum_discount_price: number;
  product_ids: string[];
  valid_from: string;
  valid_to: string;
}
