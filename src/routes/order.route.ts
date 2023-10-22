import express from 'express';
import useCatchErrors from '../error/catchErrors';
import OrderController from '../controller/order.controller';
import { isAuthenticated } from '../middlewares/auth';

export default class OrderRoute {
  router = express.Router();
  OrderController = new OrderController();
  path = '/order';

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    // get order count by timeframe
    this.router.get(
      `${this.path}s`,
      isAuthenticated,
      useCatchErrors(this.OrderController.getOrdersCountByTimeframe.bind(this.OrderController)),
    );

    this.router.get(
      `${this.path}/:order_id`,
      isAuthenticated,
      useCatchErrors(this.OrderController.getOrder.bind(this.OrderController)),
    );

    this.router.get(
      `${this.path}s/all`,
      // isAuthenticated,
      useCatchErrors(this.OrderController.getAllOrders.bind(this.OrderController)),
    );

    this.router.get(
      `${this.path}s/average`,
      isAuthenticated,
      useCatchErrors(this.OrderController.getAverageOrderValue.bind(this.OrderController)),
    );

    this.router.patch(
      `${this.path}/status/:order_id`,
      isAuthenticated,
      useCatchErrors(this.OrderController.updateOrderStatus.bind(this.OrderController)),
    );
    this.router.get(
      `${this.path}s/search/:name`,
      isAuthenticated,
      useCatchErrors(this.OrderController.getOrderByProductName.bind(this.OrderController)),
    );
  }
}
