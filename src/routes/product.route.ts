import express from 'express';
import useCatchErrors from '../error/catchErrors';
import ProductController from '../controller/product.controller';

export default class ProductRoute {
  router = express.Router();
  productController = new ProductController();
  path = '/product';

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.patch(
      `${this.path}/unpublish/:product_id`,
      useCatchErrors(this.productController.unpublishProduct.bind(this.productController)),
    );
  }
}
