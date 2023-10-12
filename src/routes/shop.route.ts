import express from 'express';
import useCatchErrors from '../error/catchErrors';
import ShopController from '../controller/shop.controller';

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

    // update shop
    this.router.patch(
      `${this.path}/:shop_id`,
      useCatchErrors(this.shopController.updateShop.bind(this.shopController))
    );

    // delete shop
    this.router.delete(`${this.path}/delete/:id`, useCatchErrors(this.shopController.deleteShop.bind(this.shopController)));

  }
}
