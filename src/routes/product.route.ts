import express from 'express';
import useCatchErrors from '../error/catchErrors';
import productController from '../controller/product.controller';
import Multer from 'multer';
import { isAuthenticated } from '../middlewares/auth';

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
    this.router.patch(
      `${this.path}/publish/:productId`,
      isAuthenticated,
      useCatchErrors(this.productController.publishProduct.bind(this.productController))
    );

    this.router.patch(
      `${this.path}/:product_id`,
      isAuthenticated,
      useCatchErrors(this.productController.updateProduct.bind(this.productController))
    );

    this.router.post(
      `${this.path}/add`,
      upload.single('image'),
      isAuthenticated,
      useCatchErrors(this.productController.addProduct.bind(this.productController))
    );

    this.router.get(
      `${this.path}/:product_id/image`,
      isAuthenticated,
      useCatchErrors(this.productController.getProductImages.bind(this.productController))
    );

    this.router.post(
      `${this.path}/:product_id/image`,
      upload.single('image'),
      isAuthenticated,
      useCatchErrors(this.productController.addImage.bind(this.productController))
    );

    this.router.patch(
      `${this.path}/:product_id/image/:image_id`,
      upload.single('image'),
      isAuthenticated,
      useCatchErrors(this.productController.updateImage.bind(this.productController))
    );

    this.router.delete(
      `${this.path}/:product_id/image/:image_id`,
      isAuthenticated,
      useCatchErrors(this.productController.deleteImage.bind(this.productController))
    );

    this.router.post(
      `${this.path}/:productId/draft`,
      upload.single('image'),
      isAuthenticated,
      useCatchErrors(this.productController.addProductDraft.bind(this.productController))
    );
    this.router.patch(
      `${this.path}/unpublish/:productId`,
      useCatchErrors(this.productController.unpublishProduct.bind(this.productController))
    );
    this.router.get(
      `${this.path}`,
      isAuthenticated,
      useCatchErrors(this.productController.SearchProductsByName.bind(this.productController))
    );
    // get product on marketplace
    this.router.get(
      `${this.path}s/marketplace`,
      useCatchErrors(this.productController.getMarketplaceProducts.bind(this.productController))
    );
    this.router.delete(
      `${this.path}/:product_id`,
      isAuthenticated,
      useCatchErrors(this.productController.deleteProduct.bind(this.productController))
    );
    this.router.get(
      `${this.path}/categories`,
      isAuthenticated,
      useCatchErrors(this.productController.getAllCategories.bind(this.productController))
    );

    this.router.post(
      `${this.path}/category`,
      isAuthenticated,
      useCatchErrors(this.productController.createCategory.bind(this.productController))
    );
    this.router.get(
      `${this.path}/:product_id`,
      isAuthenticated,
      useCatchErrors(this.productController.getProductById.bind(this.productController))
    );

    // get products on merchant account
    this.router.get(
      `${this.path}s`,
      isAuthenticated,
      useCatchErrors(this.productController.getAllProducts.bind(this.productController))
    );
  }
}
