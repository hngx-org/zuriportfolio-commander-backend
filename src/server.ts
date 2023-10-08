import ProductRoute from 'routes/product.Route';
import App from './app';
import UserRoute from './routes/user.route';

const server = new App();
server.initializedRoutes([new UserRoute(), new ProductRoute()]);
server.listen();
