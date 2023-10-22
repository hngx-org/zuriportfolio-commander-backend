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
      upload.single('image'), // dont remove this, this is the only way we can handle formData
      isAuthenticated,
      useCatchErrors(this.productController.updateProduct.bind(this.productController))
    );

    this.router.post(
      `${this.path}/add`,
      upload.single('image'),
      // isAuthenticated,
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

    this.router.patch(
      `${this.path}s/unpublish/:productId`,
      isAuthenticated,
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
    // delete category
    this.router.delete(
      `${this.path}/category/:cat_id/:type`,
      isAuthenticated,
      useCatchErrors(this.productController.deleteCategory.bind(this.productController))
    );

    this.router.get(
      `${this.path}/categories`,
      useCatchErrors(this.productController.getAllCategories.bind(this.productController))
    );

    this.router.post(
      `${this.path}/category`,
      isAuthenticated,
      useCatchErrors(this.productController.createCategory.bind(this.productController))
    );

    this.router.post(
      `${this.path}/category-v2`,
      isAuthenticated,
      useCatchErrors(this.productController.createCategoryV2.bind(this.productController))
    );

    this.router.post(
      `${this.path}/subcategory-v2`,
      isAuthenticated,
      useCatchErrors(this.productController.createSubCategoryV2.bind(this.productController))
    );

    this.router.get(
      `${this.path}/:product_id`,
      useCatchErrors(this.productController.getProductById.bind(this.productController))
    );

    // update product assets
    this.router.patch(
      `${this.path}/assets/:product_id`,
      isAuthenticated,
      useCatchErrors(this.productController.updateProductAssets.bind(this.productController))
    );

    // get product assets
    this.router.get(
      `${this.path}/assets/:product_id`,
      isAuthenticated,
      useCatchErrors(this.productController.getProductAssets.bind(this.productController))
    );

    // get products on merchant account
    this.router.get(
      `${this.path}s`,
      isAuthenticated,
      useCatchErrors(this.productController.getAllProducts.bind(this.productController))
    );

    // get merchant products without promo
    this.router.get(
      `${this.path}s/nopromo`,
      isAuthenticated,
      useCatchErrors(this.productController.getProductWithoutPromo.bind(this.productController))
    );

    // this.router.get(
    //   `${this.path}/categories/:productId`,
    //   useCatchErrors(this.productController.getProductSelectedCategories.bind(this.productController))
    // )
  }
}
