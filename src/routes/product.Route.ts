import express from 'express';
import useCatchErrors from '../error/catchErrors';
import productController from '../controller/product.Controller';

export default class ProductRoute {
  router = express.Router();
  productController = new productController();
  path = '/products';

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get(
      `${this.path}/publish/:productId`,
      useCatchErrors(this.productController.publishProduct.bind(this.productController))
    );
    this.router.post(
      `${this.path}/add`,
      useCatchErrors(this.productController.addProduct.bind(this.productController))
    );
    this.router.post(
      `${this.path}/:productId/draft`,
      useCatchErrors(this.productController.addProductDraft.bind(this.productController))
    );
  }
}
