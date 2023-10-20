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
