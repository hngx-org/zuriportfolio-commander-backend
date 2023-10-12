import { Request, Response } from 'express';
import BaseController from './base.controller';
import { PrismaClient } from '@prisma/client';
import logger from '../config/logger';

const prisma = new PrismaClient();

export default class SalesController extends BaseController {
  constructor() {
    super();
  } l

  async getAllReport(req: Request, res: Response) {
    try {
      // Get the user_id from the request
      const userId = (req as any).user?.id; // Replace with your actual logic to get user_id.

      // Parse the "timeframe" query parameter
      const timeframe = req.query.timeframe;

      if (!userId) {
        logger.error('User not found');
        return this.error(res, '/api/sales/reports', 'User not found', 404);
      }

      // Fetch the sales reports from the database using Prisma
      const salesReports = await prisma.sales_report.findMany({
        where: {
          user_id: userId,
        },
      });

      // Filter the sales reports based on the requested timeframe
      const filteredReports = salesReports.filter((report) => {
        const createdAt = new Date(report.createdAt);
        const now = new Date();

        if (timeframe === '24hr') {
          const twentyFourHoursAgo = new Date(now);
          twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
          return createdAt >= twentyFourHoursAgo;
        }else if (timeframe === '7d') {
          const sevenDaysAgo = new Date(now);
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          return createdAt >= sevenDaysAgo;
        }
        else if (timeframe === '3m') {
          const threeMonthsAgo = new Date(now);
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          return createdAt >= threeMonthsAgo;
        } else if (timeframe === '12m') {
          const twelveMonthsAgo = new Date(now);
          twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
          return createdAt >= twelveMonthsAgo;
        }else if (timeframe === '1yr') {
          const oneYearAgo = new Date(now);
          oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
          return createdAt >= oneYearAgo;
        };
      })

      this.success(res, '/api/sales/reports', 'Sales reports fetched successfully', 200, filteredReports);
    } catch (error) {
      logger.error('Error fetching sales reports: ' + error);
      this.error(res, '/api/sales/reports', 'Error fetching sales reports', 500, error);
    }
  }
}
