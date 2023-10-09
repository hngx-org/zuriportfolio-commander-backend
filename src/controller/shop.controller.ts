import { Request, Response } from 'express';
import BaseController from './base.controller';
import { productSchema } from '../helper/validate';
import logger from '../config/logger';
import { AddProductPayloadType } from '@types';
import shortUUID from 'short-uuid';

export default class ShopController extends BaseController {
  constructor() {
    super();
  }

  async createShop(req: Request, res: Response) {}
}
