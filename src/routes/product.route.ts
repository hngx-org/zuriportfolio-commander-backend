import express from 'express';
import useCatchErrors from '../error/catchErrors';
import productController from '../controller/product.controller';
import Multer from 'multer';

const storage = Multer.memoryStorage();
const upload = Multer({
  storage,
});

export default class ProductRoute {
  router = express.Router();
  productController = new productController();
  path = '/product';

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
      upload.single('image'),
      useCatchErrors(this.productController.addProduct.bind(this.productController))
    );
    this.router.post(
      `${this.path}/:productId/draft`,
      useCatchErrors(this.productController.addProductDraft.bind(this.productController))
    );
    this.router.patch(
      `${this.path}/unpublish/:productId`,
      useCatchErrors(this.productController.unpublishProduct.bind(this.productController))
    );
  }
}
