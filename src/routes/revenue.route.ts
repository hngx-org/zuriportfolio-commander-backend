import express from 'express';
import useCatchErrors from '../error/catchErrors';
import RevenueController from '../controller/revenue.controller';
import { isAuthenticated } from '../middlewares/auth';
// import { isAuthenticated } from '../middlewares/auth';

export default class RevenueRoute {
  router = express.Router();
  revenueController = new RevenueController();
  path = '/revenue';

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.patch(
      `${this.path}/:order_id`,
      isAuthenticated,
      useCatchErrors(this.revenueController.updateRevenue.bind(this.revenueController))
    );

    // Route for /api/revenues?timeframe=today
    this.router.get(
      `${this.path}s`,
      isAuthenticated,
      useCatchErrors(this.revenueController.getRevenueForToday.bind(this.revenueController))
    );
  }
}
