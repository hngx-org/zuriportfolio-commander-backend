import { Request, Response } from 'express';
import BaseController from './base.controller';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default class salesController extends BaseController {
  constructor() {
    super();
  }

  async getAllReport(req: Request, res: Response) {
    // Assuming you have the order ID from the request params
    const userId = 'sdcsvdsvsdvsvs'; // Replace with your actual parameter name

    // Fetch the salesReport details from the database using Prisma
    const salesReport = await prisma.sales_report.findMany({
      where: {
        user_id: userId,
      },
    });

    // Return the order data as part of the response
    this.success(res, '--sales/all-report', 'sales report fetch succesfully', 200, salesReport);
  }
}
