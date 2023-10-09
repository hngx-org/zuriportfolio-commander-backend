import express from 'express';
import useCatchErrors from '../error/catchErrors';
import salesController from '../controller/sales.controller';

export default class OrderRoute {
  router = express.Router();
  salesController = new salesController();
  path = '/sales';

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      `${this.path}/report/create`,
      //useCatchErrors(this.salesController.bind(this.salesController)),
    );

    this.router.get(`${this.path}/reports`, useCatchErrors(this.salesController.getAllReport.bind(this.salesController)));
    }
}
