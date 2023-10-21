import { Request, Response } from 'express';
import BaseController from './base.controller';
import logger from '../config/logger';
import prisma from '../config/prisma';
import { AddSalesReportType } from '@types';
import { saleSchema } from './../helper/validate';
import { v4 as uuidv4 } from 'uuid';

export default class SalesController extends BaseController {
  constructor() {
    super();
  }

  async getAllReport(req: Request, res: Response) {
    try {
      // Get the user_id from the request
      const userId = (req as any).user?.id // Replace with your actual logic to get user_id.

      // Parse the "timeframe" query parameter
      const timeframe = req.query.timeframe;

      if (!userId) {
        logger.error('User not found');
        return this.error(res, '/api/sales/reports', 'User not found', 404);
      }
      
      let salesReports;
      let start_date, end_date;
      let date = new Date()

      // // Filter the sales reports based on the requested timeframe
      switch (timeframe) {
        case "24h":
          start_date = date.toISOString()
          date.setHours(date.getHours() - 24)
          end_date = date.toISOString()

        salesReports = await prisma.$queryRaw`
          SELECT
            EXTRACT(HOUR FROM "createdAt") AS hour, SUM(order_price)
          FROM order_item
          WHERE "createdAt" >= ${end_date}::timestamp AND "createdAt" <= ${start_date}::timestamp
          GROUP BY EXTRACT(HOUR FROM "createdAt")
          ORDER BY hour asc;
        `
          break

        case "7d":
          start_date = date.toISOString()
          date.setDate(date.getDate() - 7)
          end_date = date.toISOString()

          salesReports = await prisma.$queryRaw`
          SELECT
            EXTRACT(DAY FROM "createdAt") AS day, SUM(order_price)
          FROM order_item
          WHERE "createdAt" >= ${end_date}::timestamp AND "createdAt" <= ${start_date}::timestamp
          GROUP BY EXTRACT(DAY FROM "createdAt")
          ORDER BY day asc;
        `
          break

        case "3m":
          start_date = date.toISOString()
          date.setDate(date.getMonth() - 3)
          end_date = date.toISOString()

          salesReports = await prisma.$queryRaw`
          SELECT
            EXTRACT(QUARTER FROM "createdAt") AS quarter, SUM(order_price)
          FROM order_item
          WHERE "createdAt" >= ${end_date}::timestamp AND "createdAt" <= ${start_date}::timestamp
          GROUP BY EXTRACT(QUARTER FROM "createdAt")
          ORDER BY quarter asc;
        `
          break

        case "12m":
          start_date = date.toISOString()
          date.setDate(date.getMonth() - 12)
          end_date = date.toISOString()

          salesReports = await prisma.$queryRaw`
          SELECT
            EXTRACT(MONTH FROM "createdAt") AS month, SUM(order_price)
          FROM order_item
          WHERE "createdAt" >= ${end_date}::timestamp AND "createdAt" <= ${start_date}::timestamp
          GROUP BY EXTRACT(MONTH FROM "createdAt")
          ORDER BY month asc;
        `
          break

        case "1y":
          salesReports = await prisma.$queryRaw`
          SELECT
            EXTRACT(YEAR FROM "createdAt") AS year, SUM(order_price)
          FROM order_item
          GROUP BY EXTRACT(YEAR FROM "createdAt")
          ORDER BY year asc;
        `
          break
        default:
          start_date = date.toISOString()
          date.setHours(date.getHours() - 24)
          end_date = date.toISOString()

          salesReports = await prisma.$queryRaw`
            SELECT
              EXTRACT(HOUR FROM "createdAt") AS hour, SUM(order_price)
            FROM order_item
            WHERE "createdAt" >= ${end_date}::timestamp AND "createdAt" <= ${start_date}::timestamp
            GROUP BY EXTRACT(HOUR FROM "createdAt")
            ORDER BY hour asc;
          `
      }
      this.success(res, '/api/sales/reports', 'Sales reports fetched successfully', 200, salesReports);
    } catch (error) {
      logger.error('Error fetching sales reports: ' + error);
      this.error(res, '/api/sales/reports', 'Error fetching sales reports', 500, error);
    }
  }

  async addReport(req: Request, res: Response) {
    const payload: AddSalesReportType = req.body;
    const { error } = saleSchema.validate(payload);

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

    // create sales report
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
