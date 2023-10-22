import express from 'express';
import cors from 'cors';
import { requestLogger } from './middlewares/logger';
import bodyParser from 'body-parser';
import logger from './config/logger';
import HandleErrors from './middlewares/error';
import { Routes } from './@types';
import swaggerUi from 'swagger-ui-express';
import swagggerJson from './doc/swagger.json';
import path from 'path';

export default class App {
  public app: express.Application;
  public env: string;
  public port: string | number;

  constructor() {
    this.app = express();
    this.port = process.env.PORT ?? 8080;
    this.initializeMiddlewares();
    this.initSwaggerUI();
  }

  initDB() {
    // * initialization of the database
  }

  initializeMiddlewares() {
    // initialize server middlewares
    this.app.use(requestLogger);
    this.app.use(
      cors({
        origin: '*',
        credentials: true,
      })
    );
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use('/', express.static(path.join(__dirname, '..', 'src/public')));
  }

  initSwaggerUI() {
    // handle swagger-doc
    this.app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swagggerJson));
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
      this.app.use('/api/v1', route.router);
    });

    this.app.use('/', (req, res) => {
      res.sendFile(path.join(__dirname, '..', 'src/public/views', 'index.html'));
    });

    this.app.use('/api', (req, res) => {
      res.sendFile(path.join(__dirname, '..', 'src/public/views', 'index.html'));
    });

    this.initSwaggerUI();

    this.app.all('*', (req, res) => {
      res.status(404);
      if (req.accepts('html')) {
        return res.sendFile(path.join(__dirname, '..', 'src/public/views', '404.html'));
      } else if (req.accepts('json')) {
        return res.json({ message: '404 Not Found' });
      } else {
        return res.type('txt').send('404 Not Found');
      }
    });
    // handle global errors
    this.app.use(HandleErrors);
  }
}
