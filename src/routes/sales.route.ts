import express from 'express';
import useCatchErrors from '../error/catchErrors';
import salesController from '../controller/sales.controller';
import { isAuthenticated } from '../middlewares/auth';

export default class SalesRoute {
  router = express.Router();
  salesController = new salesController();
  path = '/sales';

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get(
      `${this.path}/reports`,
      isAuthenticated,
      useCatchErrors(this.salesController.getSalesReports.bind(this.salesController))
    );
  }
}
