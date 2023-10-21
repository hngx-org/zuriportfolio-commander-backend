import express from 'express';
import useCatchErrors from '../error/catchErrors';
import ActivityController from '../controller/activity.controller';
import { isAuthenticated } from '../middlewares/auth';

export default class ActivityRoute {
  router = express.Router();
  ActivityController = new ActivityController();
  path = '/activities';

  constructor() {
      this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get(
      `${this.path}`,
    //   isAuthenticated,
      useCatchErrors(this.ActivityController.getAllActivities.bind(this.ActivityController))
    );

    this.router.post(
        `${this.path}/seed`,
        // isAuthenticated,
        useCatchErrors(this.ActivityController.seed.bind(this.ActivityController))
    );

  }
  
  


}