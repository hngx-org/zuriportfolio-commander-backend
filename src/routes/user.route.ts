import express from "express";
import useCatchErrors from "../error/catchErrors";
import UserController from "../controller/user.controller";

export default class UserRoute {
  router = express.Router();
  userController = new UserController();
  path = "/user";

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get(
      `${this.path}/data`,
      useCatchErrors(this.userController.getUser.bind(this.userController))
    );
  }
}
