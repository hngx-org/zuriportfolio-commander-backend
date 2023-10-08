import express from 'express';
import useCatchErrors from '../error/catchErrors';
import ProductController from '../controller/product.controller';

export default class ProductRoute {
  router = express.Router();
  productController = new ProductController();
  path = '/products';

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get(
      `${this.path}/publish/:productId`,
      useCatchErrors(this.productController.publishProduct.bind(this.productController)),
    );
    this.router.post(
      `${this.path}/add`,
      useCatchErrors(this.productController.addProduct.bind(this.productController)),
    );
    this.router.patch(
      `${this.path}/unpublish/:productId`,
      useCatchErrors(this.productController.unpublishProduct.bind(this.productController)),
    );
  }
}
