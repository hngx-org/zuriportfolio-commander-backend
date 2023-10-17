import { Request, Response } from 'express';
import BaseController from './base.controller';
import { uploadSingleImage } from '../helper/uploadImage';
import { deleteImage } from '../helper/deleteImage';
import logger from '../config/logger';
import { AddProductPayloadType } from '@types';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/prisma';
import { isUUID, removeDuplicate } from '../helper';
import { TestUserId } from '../config/test';
import { createActivitySchema } from '../helper/validate';

export default class ActivityController extends BaseController {
  constructor() {
    super();
  }

  async addActivity(req: Request, res: Response) {
    // Assuming user_id is available in the request (you might need to adapt this part)
    const user_id = (req as any).user?.id ?? TestUserId;
    const {error, value} = createActivitySchema.validate(req.body);
    if (error){
        return this.error(res,"--addActivity/invalid request", "Invalid requets", 400)
    }
    const { action, title, description } = value;
    // Create activity in the database
    const newActivity = await prisma.activity.create({
      data: {
        user: {
          connect: {
            id: user_id,
          },
        },
        action,
        title,
        description,
      },
    });

    return res.status(201).json({
      message: 'Activity recorded successfully',
      data: newActivity,
    });
  }
}
