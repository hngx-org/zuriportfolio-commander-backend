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
    this.router.post(`${this.path}/create`, useCatchErrors(this.shopController.createShop.bind(this.shopController)));
get-all-shops
    this.router.get(
      `${this.path}s`,
      isAuthenticated,
      useCatchErrors(this.shopController.getAllShops.bind(this.shopController))
    );

    // delete shop
    this.router.delete(`${this.path}/delete/:id`, useCatchErrors(this.shopController.deleteShop.bind(this.shopController)));
 dev
  }
}
