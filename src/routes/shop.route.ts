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
      isAuthenticated,
      useCatchErrors(this.shopController.createShop.bind(this.shopController))
    );
    // delete shop
    this.router.delete(
      `${this.path}/delete/:id`, isAuthenticated,
      useCatchErrors(this.shopController.deleteShop.bind(this.shopController))
    );

    // Get all shops
    this.router.get(`${this.path}s`, isAuthenticated, useCatchErrors(this.shopController.getAllShops.bind(this.shopController)));

    // get a shop
    this.router.get(
      `${this.path}/:merchant_id`,
      useCatchErrors(this.shopController.getShopByMerchantId.bind(this.shopController))
    );

    // update shop route
    this.router.patch(
      `${this.path}/:shop_id`,
      isAuthenticated,
      useCatchErrors(this.shopController.updateShop.bind(this.shopController))
    );

    // shop traffic
    this.router.post(
      `${this.path}/store-traffic`,
      useCatchErrors(this.shopController.shopTraffic.bind(this.shopController))
    );
  }
}
