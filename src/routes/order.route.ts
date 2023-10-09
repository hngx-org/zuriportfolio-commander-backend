import express from 'express';
import useCatchErrors from '../error/catchErrors';
import OrderController from '../controller/order.controller';

export default class OrderRoute {
  router = express.Router();
  OrderController = new OrderController();
  path = '/orders';

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      `${this.path}/sales-report/:order_id`,
      useCatchErrors(this.OrderController.getOrder.bind(this.OrderController)),
    );

    this.router.get(`${this.path}`, useCatchErrors(this.OrderController.getAllOrders.bind(this.OrderController)));
  }
}
