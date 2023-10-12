import { Request, Response } from 'express';
import BaseController from './base.controller';
import { PrismaClient } from '@prisma/client';
import { createCategorySchema } from 'helper/validate';

const prisma = new PrismaClient();

export default class categoryController extends BaseController{
   constructor(){
    super()
   }
   async createCategory(req: Request, res: Response){

      const { error, value } = createCategorySchema.validate(req.body);

   if (error) {
      return res.status(400).json({ error: error.message });
      
   }
   const { parent_id, name, product_id } = value;

      // Checking if parent_id is null to determine if it's a parent or subcategory
   if (parent_id === null || parent_id === undefined) {
        // Creating a parent category
        const parentCategory = await prisma.product_category.create({
          data: {       
            name,
            product: product_id
                  
          }
        });
  
        return this.success(res, '--created-parentCategory/success', `${name} created successfully`, 201, {
         parentCategory
        });
      }

      const subCategory = await prisma.product_sub_category.create({
         data: {
           name,
           parent_category_id: parent_id,
         },
       });
       return this.success(res, '--created-subCategory/success', `${name} created successfully`, 201, {subCategory});
   }
}