import express from 'express';
import useCatchErrors from '../error/catchErrors';
import CreateDiscountController from '../controller/createDiscount.controller';

export default class CreateDiscountRoute {
  router = express.Router();
  CreateDiscountController = new CreateDiscountController();
  path = '/user';

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      `${this.path}/creatediscount`,
      useCatchErrors(this.CreateDiscountController.createDiscount.bind(this.CreateDiscountController))
    );
  }
}
