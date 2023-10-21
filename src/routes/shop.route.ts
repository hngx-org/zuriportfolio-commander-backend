import express from 'express';
import useCatchErrors from '../error/catchErrors';
import ShopController from '../controller/shop.controller';
import { isAuthenticated } from '../middlewares/auth';

export default class ShopRoute {
  router = express.Router();
  shopController = new ShopController();
  path = '/shops';

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
      `${this.path}/delete/:id`,
      isAuthenticated,
      useCatchErrors(this.shopController.deleteShop.bind(this.shopController))
    );

    // Get all shops
    this.router.get(`${this.path}`, useCatchErrors(this.shopController.getAllShops.bind(this.shopController)));

    // Get shop by authenticated user
    this.router.get(
      `${this.path}/merchant`,
      isAuthenticated,
      useCatchErrors(this.shopController.getMerchantShops.bind(this.shopController))
    );

    // get a shop
    this.router.get(`${this.path}/:shopId`, useCatchErrors(this.shopController.getShopId.bind(this.shopController)));

    // update shop route
    this.router.patch(
      `${this.path}/:shopId`,
      isAuthenticated,
      useCatchErrors(this.shopController.updateShop.bind(this.shopController))
    );

    // shop traffic
    this.router.post(
      `${this.path}/store-traffic`,
      useCatchErrors(this.shopController.shopTraffic.bind(this.shopController))
    );
    this.router.get(
      `${this.path}/store-traffic/count/12months/:shopId`,
      useCatchErrors(this.shopController.getShopTrafficByFullYear.bind(this.shopController)),
    );
    this.router.get(
      `${this.path}/store-traffic/count/3months/:shopid`,
      useCatchErrors(this.shopController.getShopTrafficByThreeMonths.bind(this.shopController)),
    );
    this.router.get(
      `${this.path}/store-traffic/count/30days/:shopId`,
      useCatchErrors(this.shopController.getShopTrafficForLast30Days.bind(this.shopController)),
    );
    this.router.get(
      `${this.path}/store-traffic/count/7days/:shopId`,
      useCatchErrors(this.shopController.getShopTrafficForLast7Days.bind(this.shopController)),
    );
    this.router.get(
      `${this.path}/store-traffic/count/24hrs/:shopId`,
      useCatchErrors(this.shopController.getShopTrafficForLast24Hours.bind(this.shopController)),
    );
  }
}
