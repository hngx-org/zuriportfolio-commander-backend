import { Request, Response } from 'express';
import BaseController from './base.controller';
import { PrismaClient } from '@prisma/client';
import { TestUserId } from '../config/test';
import { compile } from 'joi';
const validStatusValues = ['pending', 'complete', 'failed'];

const prisma = new PrismaClient();

export default class ActivityController extends BaseController {
  constructor() {
    super();
  }

  async getAllActivities(req: Request, res: Response) {
    const userId = (req as any).user?.id ?? TestUserId;


    const activities = await prisma.activity.findMany({
        where: {
            user_id: userId,
        },
        select: {
            user: {
                select: {
                    merchant_orders: {
                        where: {
                            status: "complete"
                        },
                        select:{
                            customer: {
                                select: {
                                    first_name: true,
                                    last_name: true
                                }
                            },
                            order_item: {
                                select: {
                                    product:{
                                        select:{
                                            name: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    })

    if (!activities) {
        return this.error(res, '--activities/internal-server-error', 'Internal server Error', 500);
    }
  
    const response = {
        data: {
          totalResults: activities.length,
          activities: activities,
        },
    };
  
    this.success(res, '--api/activities', 'activities fetched successfully', 200, response);
  }


  async seed(req: Request, res: Response) {
    const payload = req.body;

    const created = await prisma.product_category.create({ data: payload });

    this.success(res, '--seed/created', 'seed created', 200, created);
  }

}
  


// import { Request, Response } from 'express';
// import BaseController from './base.controller';
// import { v4 as uuidv4 } from 'uuid';
// import prisma from '../config/prisma';
// import { TestUserId } from '../config/test';
// import { createActivitySchema } from '../helper/validate';

// export default class ActivityController extends BaseController {
//   constructor() {
//     super();
//   }

//   async addActivity(req: Request, res: Response) {
//     const user_id = (req as any).user?.id ?? TestUserId;
//     const { error, value } = createActivitySchema.validate(req.body);
//     if (error) {
//       return this.error(res, '--addActivity/invalid request', 'Invalid requets', 400);
//     }
//     const { action, title, description } = value;
//     // Creating activity in the database
//     const activityId = uuidv4();
//     const newActivity = await prisma.activity.create({
//       data: {
//         id: activityId,
//         action: action,
//         user: {
//           connect: {
//             id: user_id,
//           },
//         },
//         title: title,
//         description: description,
//       },
//     });

//     return this.success(res, '--addActivity/success', 'Activity recorded successfully', 201, newActivity);
//   }
// }
