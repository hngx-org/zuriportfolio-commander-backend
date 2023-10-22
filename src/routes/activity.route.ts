import express from 'express';
import useCatchErrors from '../error/catchErrors';
import { isAuthenticated } from '../middlewares/auth';
import ActivityController from '../controller/activity.controller';

export default class ActivitiesRoute {
  router = express.Router();
  activitiesController = new ActivityController();
  path = '/activities';

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get(
      `${this.path}`,
      //   isAuthenticated,
      useCatchErrors(this.activitiesController.getActivities.bind(this.activitiesController)),
    );
  }
}
