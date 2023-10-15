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
<<<<<<< HEAD
    // get order count by timeframe
=======

    this.router.get(`${this.path}/:id`,
      isAuthenticated, useCatchErrors(this.OrderController.getAllOrders.bind(this.OrderController)));

>>>>>>> 49279c07e29415110ea783067bf3d81bf641dd71
    this.router.get(
      `${this.path}s`,
      isAuthenticated,
      useCatchErrors(this.OrderController.getOrdersCountByTimeframe.bind(this.OrderController))
    );

    this.router.get(
<<<<<<< HEAD
      `${this.path}/:order_id`,
      isAuthenticated,
=======
      `${this.path}/sales-report/:order_id`, isAuthenticated,
>>>>>>> 49279c07e29415110ea783067bf3d81bf641dd71
      useCatchErrors(this.OrderController.getOrder.bind(this.OrderController))
    );

    this.router.get(
      `${this.path}s/all`,
      isAuthenticated,
      useCatchErrors(this.OrderController.getAllOrders.bind(this.OrderController))
    );

    this.router.get(
      `${this.path}s/average`,
      isAuthenticated,
      useCatchErrors(this.OrderController.getAverageOrderValue.bind(this.OrderController))
    );

    this.router.patch(
      `${this.path}/status/:order_id`,
      isAuthenticated,
      useCatchErrors(this.OrderController.updateOrderStatus.bind(this.OrderController))
    );
    this.router.get(
      `${this.path}/search/:name`,
      isAuthenticated,
      useCatchErrors(this.OrderController.getOrderByProductName.bind(this.OrderController))
    );
  }
}
