import ProductRoute from 'routes/product.Route';
import App from './app';
import UserRoute from './routes/user.route';
import OrderRoute from './routes/order.route';

const server = new App();
server.initializedRoutes([new UserRoute(), new OrderRoute(), new ProductRoute()]);
server.listen();
