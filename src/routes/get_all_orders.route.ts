import express from 'express';
import useCatchErrors from '../error/catchErrors';
import GetAllOrdersController from '../controller/get_all_orders.controller';

export default class GetAllOrdersRoute {
  router = express.Router();
  getAllOrdersController = new GetAllOrdersController();
  path = '/orders';

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get(
      `${this.path}`,
      useCatchErrors(this.getAllOrdersController.getAllOrders.bind(this.getAllOrdersController))
    );
  }
}
