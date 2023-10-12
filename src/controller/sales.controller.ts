import { Request, Response } from 'express';
import BaseController from './base.controller';
import { PrismaClient } from '@prisma/client';
import { saleSchema } from 'helper/validate';
import { AddSalesReportType } from '@types';
import { v4 as uuidv4 } from 'uuid';

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

  async addReport(req: Request, res: Response) {
    const payload: AddSalesReportType = req.body;
    const { error, value } = saleSchema.validate(payload);

    if (error) {
      return this.error(res, '--sales/invalid-fields', error?.message ?? 'missing order details', 400);
    }

    const id = uuidv4();
    const { user_id, sales, order_id } = payload;

    // check if user exist
    const userExists = await prisma.user.findFirst({
      where: { id: user_id },
    });

    if (!userExists) {
      return this.error(res, '--shop/merchant-not found', 'merchant not find', 404);
    }

    // create report
    const created = await prisma.sales_report.create({
      data: {
        id,
        user_id,
        sales,
        order_id,
      },
    });

    this.success(res, 'Sales report added', 'Sales report has been added successfully', 201, {
      ...created,
    });
  }
}
