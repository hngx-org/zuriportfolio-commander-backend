import express from 'express';
import cors from 'cors';
import { requestLogger } from './middlewares/logger';
import bodyParser from 'body-parser';
import logger from './config/logger';
import HandleErrors from './middlewares/error';
import { Routes } from './interface/routes.interface';

export default class App {
  public app: express.Application;
  public env: string;
  public port: string | number;

  constructor() {
    this.app = express();
    this.port = process.env.PORT ?? 8080;
    this.initializeMiddlewares();
  }

  initDB() {
    // * initialization of the database
  }

  initializeMiddlewares() {
    // initialize server middlewares
    this.app.use(requestLogger);
    this.app.use(
      cors({
        origin: ['http://127.0.0.1:3000', 'http://localhost:3000', '*'],
        credentials: true,
      }),
    );
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
  }

  listen() {
    // initialize database
    this.initDB();
    // listen on server port
    this.app.listen(this.port, () => {
      logger.info('Server started at http://localhost:' + this.port);
    });
  }

  initializedRoutes(routes: Routes[]) {
    // initialize all routes middleware
    routes.forEach((route) => {
      this.app.use('/api', route.router);
    });

    this.app.all('*', (req, res) => {
      return res.status(404).json({
        errorStatus: true,
        code: '--route/route-not-found',
        message: 'The requested route was not found.',
      });
    });
    // handle global errors
    this.app.use(HandleErrors);
  }
}
