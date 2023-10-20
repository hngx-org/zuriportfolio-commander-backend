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
  categoryId: string;
  shopId: string;
  sub_category_id: number;
  category_id: number; //!Remove this.
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
  quantity: number;
  maximum_discount_price: number;
  product_ids: string[];
  valid_from: string;
  valid_to: string;
}

export interface UpdateDiscountType {
  discount_type: string;
  amount: number;
  code: string;
  quantity: number;
  maximum_discount_price: number;
  product_ids: string[];
  valid_from: string;
  valid_to: string;
}
