import express from 'express';
import useCatchErrors from '../error/catchErrors';
import ShopController from '../controller/shop.controller';
import { isAuthenticated } from '../middlewares/auth';

export default class ShopRoute {
  router = express.Router();
  shopController = new ShopController();
  path = '/shop';

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    // create shop
    this.router.post(
      `${this.path}`,
      // isAuthenticated,
      useCatchErrors(this.shopController.createShop.bind(this.shopController))
    );
    // delete shop
    this.router.delete(
      `${this.path}/delete/:id`,
      useCatchErrors(this.shopController.deleteShop.bind(this.shopController))
    );
  }
}
