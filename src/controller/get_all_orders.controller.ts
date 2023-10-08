import { Request, Response } from 'express';
import BaseController from './base.controller';
import prisma from 'config/prisma';

export default class GetAllOrdersController extends BaseController {
  constructor() {
    super();
  }

  async getAllOrders(req: Request, res: Response) {
    const userId = req.params.id; // get the user id from the request params

    if (!userId) {
      this.error(res, '--order/all', 'This user id does not exist', 400, 'user not found');
    }

    const orders = await prisma.order.findMany({
      where: {
        id: userId,
      },
    });

    this.success(res, '--order/all', 'orders fetched successfully', 200, orders);
  }
}
