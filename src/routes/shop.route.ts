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
      useCatchErrors(this.shopController.createShop.bind(this.shopController)),
    );
    // delete shop
    this.router.delete(
      `${this.path}/delete/:id`,
      isAuthenticated,
      useCatchErrors(this.shopController.deleteShop.bind(this.shopController)),
    );

    // Get all shops
    this.router.get(`${this.path}s`, useCatchErrors(this.shopController.getAllShops.bind(this.shopController)));

    // Get shop by authenticated user
    this.router.get(
      `${this.path}s/merchant`,
      isAuthenticated,
      useCatchErrors(this.shopController.getMerchantShops.bind(this.shopController)),
    );

    // get a shop
    this.router.get(
      `${this.path}/:shop_id`,
      useCatchErrors(this.shopController.getProductsByShopId.bind(this.shopController)),
    );

    // update shop route
    this.router.patch(
      `${this.path}/:shop_id`,
      isAuthenticated,
      useCatchErrors(this.shopController.updateShop.bind(this.shopController)),
    );

    // shop traffic
    this.router.post(
      `${this.path}/store-traffic`,
      useCatchErrors(this.shopController.shopTraffic.bind(this.shopController)),
    );

    //get shop traffic for 12 months 
    this.router.get(
      `${this.path}/store-traffic/count/12months/:shop_id`,
      useCatchErrors(this.shopController.getShopTrafficByFullYear.bind(this.shopController)),
    );

    // get shop traffic for 3 months
    this.router.get(
      `${this.path}/store-traffic/count/3months/:shop_id`,
      useCatchErrors(this.shopController.getShopTrafficByThreeMonths.bind(this.shopController)),
    );

    // get shop traffic for 30 days
    this.router.get(
      `${this.path}/store-traffic/count/30days/:shop_id`,
      useCatchErrors(this.shopController.getShopTrafficForLast30Days.bind(this.shopController)),
    );

    // get shop traffic for 7 days || one week
    this.router.get(
      `${this.path}/store-traffic/count/7days/:shop_id`,
      useCatchErrors(this.shopController.getShopTrafficForLast7Days.bind(this.shopController)),
    );

    // get shop traffic for a day || 24 hours
    this.router.get(
      `${this.path}/store-traffic/count/24hrs/:shop_id`,
      useCatchErrors(this.shopController.getShopTrafficForLast24Hours.bind(this.shopController)),
    );
  }
}
