import { Request, Response } from "express";
import BaseController from "./base.controller";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default class RevenueController extends BaseController {
  constructor() {
    super();
  }

  async updateRevenue(req: Request, res: Response) {
    const { order_id, user_id, revenue } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: order_id },
    });

    if (!order) {
      throw new Error('Order not found.');
    }

    if (order.status !== 'complete') {
      return res.status(400).json({ error: 'Order is not completed' });
    }

    const newRevenue = order.amount + revenue;

    await prisma.revenue.update({
      where: { id: user_id },
      data: { amount: newRevenue },
    });

    this.success(
      res,
      "revenues",
      "Revenue updated successfully",
      200,
      newRevenue
    );
  }
}
