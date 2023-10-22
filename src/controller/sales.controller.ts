import { Request, Response } from 'express';
import BaseController from './base.controller';
import logger from '../config/logger';
import prisma from '../config/prisma';
import { TestUserId } from '../config/test';

type ValidTimeFrame = '1d' | '7d' | '30d' | '3m' | '12m' | '1yr' | '24hr';

export default class SalesController extends BaseController {
  constructor() {
    super();
  }

  async getAllReport(req: Request, res: Response) {
    try {
      // Get the user_id from the request
      const userId = (req as any).user?.id ?? TestUserId; // Replace with your actual logic to get user_id.

      // Parse the "timeframe" query parameter
      const timeframe = req.query.timeframe;

      if (!userId) {
        logger.error('User not found');
        return this.error(res, '/api/sales/reports', 'User not found', 404);
      }

      let salesReports;
      let start_date, end_date;
      let date = new Date();

      // // Filter the sales reports based on the requested timeframe
      switch (timeframe) {
        case '24h':
          start_date = date.toISOString();
          date.setHours(date.getHours() - 24);
          end_date = date.toISOString();

          salesReports = await prisma.$queryRaw`
          SELECT
            EXTRACT(HOUR FROM "createdAt") AS hour, SUM(order_price)
          FROM order_item
          WHERE "createdAt" >= ${end_date}::timestamp AND "createdAt" <= ${start_date}::timestamp
          GROUP BY EXTRACT(HOUR FROM "createdAt")
          ORDER BY hour asc;
        `;
          break;

        case '7d':
          start_date = date.toISOString();
          date.setDate(date.getDate() - 7);
          end_date = date.toISOString();

          salesReports = await prisma.$queryRaw`
          SELECT
            EXTRACT(DAY FROM "createdAt") AS day, SUM(order_price)
          FROM order_item
          WHERE "createdAt" >= ${end_date}::timestamp AND "createdAt" <= ${start_date}::timestamp
          GROUP BY EXTRACT(DAY FROM "createdAt")
          ORDER BY day asc;
        `;
          break;

        case '3m':
          start_date = date.toISOString();
          date.setDate(date.getMonth() - 3);
          end_date = date.toISOString();

          salesReports = await prisma.$queryRaw`
          SELECT
            EXTRACT(QUARTER FROM "createdAt") AS quarter, SUM(order_price)
          FROM order_item
          WHERE "createdAt" >= ${end_date}::timestamp AND "createdAt" <= ${start_date}::timestamp
          GROUP BY EXTRACT(QUARTER FROM "createdAt")
          ORDER BY quarter asc;
        `;
          break;

        case '12m':
          start_date = date.toISOString();
          date.setDate(date.getMonth() - 12);
          end_date = date.toISOString();

          salesReports = await prisma.$queryRaw`
          SELECT
            EXTRACT(MONTH FROM "createdAt") AS month, SUM(order_price)
          FROM order_item
          WHERE "createdAt" >= ${end_date}::timestamp AND "createdAt" <= ${start_date}::timestamp
          GROUP BY EXTRACT(MONTH FROM "createdAt")
          ORDER BY month asc;
        `;
          break;

        case '1y':
          salesReports = await prisma.$queryRaw`
          SELECT
            EXTRACT(YEAR FROM "createdAt") AS year, SUM(order_price)
          FROM order_item
          GROUP BY EXTRACT(YEAR FROM "createdAt")
          ORDER BY year asc;
        `;
          break;
        default:
          start_date = date.toISOString();
          date.setHours(date.getHours() - 24);
          end_date = date.toISOString();

          salesReports = await prisma.$queryRaw`
            SELECT
              EXTRACT(HOUR FROM "createdAt") AS hour, SUM(order_price)
            FROM order_item
            WHERE "createdAt" >= ${end_date}::timestamp AND "createdAt" <= ${start_date}::timestamp
            GROUP BY EXTRACT(HOUR FROM "createdAt")
            ORDER BY hour asc;
          `;
      }
      this.success(res, '/api/sales/reports', 'Sales reports fetched successfully', 200, salesReports);
    } catch (error) {
      logger.error('Error fetching sales reports: ' + error);
      this.error(res, '/api/sales/reports', 'Error fetching sales reports', 500, error);
    }
  }

  getFrameLabel(date: Date, timeframe: ValidTimeFrame) {
    const validDays = ['7d', '30d'];
    const validHr = ['24hr', '1d'];
    const validMonths = ['3m', '12m', '1yr'];
    let label = '';
    if (validHr.includes(timeframe)) {
      label = date.toLocaleString('en-US', { hour: '2-digit' });
    }
    if (validDays.includes(timeframe)) {
      label = date.toLocaleString('en-US', { weekday: 'short' });
    }
    if (validMonths.includes(timeframe)) {
      label = date.toLocaleString('en-US', { month: 'long' });
    }
    return label;
  }

  async groupOrderItemsByTimeframe(timeframe, userId) {
    // Calculate the start date based on the selected timeframe
    const currentDate = new Date();
    let startDate = new Date();

    switch (timeframe) {
      case '1d':
        startDate.setDate(currentDate.getDate() - 1);
        break;
      case '24hr':
        startDate.setDate(currentDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(currentDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(currentDate.getDate() - 30);
        break;
      case '3m':
        startDate.setMonth(currentDate.getMonth() - 3);
        break;
      case '12m':
        startDate.setMonth(currentDate.getMonth() - 12);
        break;
      case '1yr':
        startDate.setFullYear(currentDate.getFullYear() - 1);
        break;
      default:
        break;
    }

    // Query order_items data within the specified timeframe
    const orderItems = await prisma.order_item.findMany({
      where: {
        merchant_id: userId,
        createdAt: {
          gte: startDate,
          lte: currentDate,
        },
      },
      include: {
        product: true,
      },
    });

    // Create a report object with default values
    const report = {
      timeframe: timeframe,
      reports: [],
    };

    // Create a map to store sales data for each month
    const timeframeSales = new Map();

    while (startDate <= currentDate) {
      const frameLabel = this.getFrameLabel(startDate, timeframe);
      timeframeSales.set(frameLabel, 0);

      if (timeframe === '12m' || timeframe === '1yr') {
        startDate.setMonth(startDate.getMonth() + 1);
      } else if (timeframe === '3m') {
        startDate.setMonth(startDate.getMonth() + 1);
      } else if (timeframe === '30d') {
        startDate.setDate(startDate.getDate() + 1);
      } else if (timeframe === '1m') {
        startDate.setMonth(startDate.getMonth() + 1);
      } else {
        startDate.setDate(startDate.getDate() + 1);
      }
    }

    if (timeframe === '24hr' || timeframe === '1d') {
      // Create an array to store the frames
      const frames = [];

      for (let i = 0; i < 24; i++) {
        const date = new Date();
        date.setHours(i);
        const frameLabel = this.getFrameLabel(date, timeframe);

        // Create an object for each frame and add it to the frames array
        frames.push({ frame: frameLabel, sales: 0 });
      }

      // Set the frames array as the report.reports
      report.reports = frames;
    }

    if (orderItems.length > 0) {
      for (const item of orderItems) {
        const createdAt = new Date(item.createdAt);
        const promo = item.promo_id;
        let sales = 0;
        let currentSales;
        console.log({ timeframe }, timeframe === '24hr');
        if (promo) {
          sales = item.order_price + item.order_VAT - item.order_discount;
        } else {
          sales = item.order_price + item.order_VAT;
        }
        if (timeframe === '24hr') {
          const hour = createdAt.getHours();
          currentSales = timeframeSales.get(hour) || 0;
          timeframeSales.set(hour, currentSales + sales);

          const frameLabel = this.getFrameLabel(createdAt, timeframe);
          timeframeSales.set(frameLabel, currentSales + sales);
        } else {
          const frameLabel = this.getFrameLabel(createdAt, timeframe);
          currentSales = timeframeSales.get(frameLabel) || 0;
          timeframeSales.set(frameLabel, currentSales + sales);
        }
      }

      // Convert the timeframeSales map to the salesReport format
      timeframeSales.forEach((sales, frameLabel) => {
        report.reports.push({ frame: frameLabel, sales, currency: orderItems[0].product.currency });
      });
    }

    return report;
  }

  async getSalesReports(req: Request, res: Response) {
    const userId = (req as any).user?.id ?? TestUserId;
    const timeframe = req.query.timeframe ?? '7d';

    const result = await this.groupOrderItemsByTimeframe(timeframe, userId);

    this.success(res, '--sales-report/success', 'sales report fetched', 200, result);
  }
}
