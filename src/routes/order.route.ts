import express from 'express';
import useCatchErrors from '../error/catchErrors';
import OrderController from '../controller/order.controller';
import { isAuthenticated } from '../middlewares/auth';
export default class OrderRoute {
  router = express.Router();
  OrderController = new OrderController();
  path = '/orders';

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get(
      `${this.path}/sales-report/:order_id`,
      useCatchErrors(this.OrderController.getOrder.bind(this.OrderController))
    );

    this.router.get(`${this.path}`, 
    //isAuthenticated
    useCatchErrors(this.OrderController.getAllOrders.bind(this.OrderController)));

    // this.router.get(
    //   `${this.path}/average`,
    //   // isAuthenticated,
    //   useCatchErrors(this.OrderController.getAverageOrderValue.bind(this.OrderController))
    // );

    // this.router.patch(
    //   `${this.path}/status/:order_id`,
    //   // isAuthenticated,
    //   useCatchErrors(this.OrderController.updateOrderStatus.bind(this.OrderController))
    // );
  }
}
