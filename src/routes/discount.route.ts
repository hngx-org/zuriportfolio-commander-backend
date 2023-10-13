import express from 'express';
import useCatchErrors from '../error/catchErrors';
import DiscountController from '../controller/discount.controller';
import { isAuthenticated } from '../middlewares/auth';

export default class DiscountRoute {
  router = express.Router();
  discountController = new DiscountController();
  path = '/discount';

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      `${this.path}`,
      // isAuthenticated,
      useCatchErrors(this.discountController.createDiscount.bind(this.discountController)),
    );

    this.router.get(
      `${this.path}/all`,
      useCatchErrors(this.discountController.getAllDiscount.bind(this.discountController)),
    );

    this.router.get(
      `${this.path}/promotions`,
      isAuthenticated,
      useCatchErrors(this.discountController.getAllPromotionsWithTrackedPromotions.bind(this.discountController))
    );
  }
}
