import express from "express";
import useCatchErrors from "../error/catchErrors";
import productController from "../controller/product.Controller";

export default class productRoute {
  router = express.Router();
  productController = new productController();
  path = "/products";

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get(
      `${this.path}/publish/:productId`,
      useCatchErrors(this.productController.publishProduct.bind(this.productController))
    );
  }
}





