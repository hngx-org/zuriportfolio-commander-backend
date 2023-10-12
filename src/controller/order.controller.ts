import { Request, Response } from 'express';
import BaseController from './base.controller';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default class OrderController extends BaseController {
  constructor() {
    super();
  }

  async getOrder(req: Request, res: Response) {
    // Assuming you have the order ID from the request params
    const orderId = req.params.order_id; // Replace with your actual parameter name

    // Fetch the order details from the database using Prisma
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
      },
      include: {
        //merchant: true,
        customer: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Return the order data as part of the response
    this.success(
      res,
      '--product/updated',
      'product updated successfully',
      200,
      { data: order }, // Include the order data in the response
    );
  }

  async getAllOrders(req: Request | any, res: Response | any) {
    try{
    //const userId = (req as any).user?.id;
    const userId = "00b0b915a-f5a7-47d8-85a3-57c11d34c7v5";
    if (!userId) {
       return this.error(res, '--order/all', 'This user id does not exist', 400, 'user not found');
     }

    const orders = await prisma.user.findMany({
      where : {
        id : userId, 
      },
      include : {
      order_items : {
        where :{
          merchant_id : userId,
        },
        include : {
          customer : {
            include : {
              customer_order_items : {
                include : {
                   
                }
              }
            }
          }
        }
      }

      }

     
    });

    return this.success(res, '--order/all', 'orders fetched successfully', 200, orders);
  } catch (error) {
    console.error(error);
    return this.error(res, '--order/all', 'An error occurred', 500, 'internal server error');
  }
  }
}
