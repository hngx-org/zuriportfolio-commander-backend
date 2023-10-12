import express from 'express';
import useCatchErrors from '../error/catchErrors';
import categoryController from '../controller/category.controller';
import { isAuthenticated } from 'middlewares/auth';


export default class ProductRoute {
  router = express.Router();
  categoryController = new categoryController();
  path = 'product/categories';

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      `${this.path}/`,
       isAuthenticated,
      useCatchErrors(this.categoryController.createCategory.bind(this.categoryController))
    )}};