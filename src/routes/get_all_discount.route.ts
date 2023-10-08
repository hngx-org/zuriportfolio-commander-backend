import express from 'express';
import useCatchErrors from '../error/catchErrors';
import GetAllDiscountController from '../controller/get_all_discount.controller';

export default class GetAllDiscountRoute {
  router = express.Router();
  getAllDiscountController = new GetAllDiscountController();
  path = '/discounts';

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get(
      `${this.path}`,
      useCatchErrors(this.getAllDiscountController.getAllDiscount.bind(this.getAllDiscountController)),
    );
  }
}
