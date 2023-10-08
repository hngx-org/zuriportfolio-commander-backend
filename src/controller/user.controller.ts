import { Request, Response } from "express";
import BaseController from "./base.controller";

export default class UserController extends BaseController {
  constructor() {
    super();
  }

  async getUser(req: Request, res: Response) {
    const userdata = [
      {
        name: "john doe",
        email: "john@mail.com",
      },
      {
        name: "brain tracy",
        email: "brian@mail.com",
      },
    ];
    this.success(
      res,
      "--user/fake-data",
      "user data fetched successfully",
      200,
      userdata
    );
  }
}

