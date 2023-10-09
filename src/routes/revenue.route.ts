import express from 'express';
import useCatchErrors from '../error/catchErrors';
import RevenueController from '../controller/revenue.controller';

export default class RevenueRoute {
  router = express.Router();
  revenueController = new RevenueController();
  path = '/revenue';

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.patch(
      `${this.path}/update`,
      useCatchErrors(this.revenueController.updateRevenue.bind(this.revenueController))
    );
  }
}
