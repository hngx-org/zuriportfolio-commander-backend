import ProductRoute from './routes/product.Route';
import App from './app';
import UserRoute from './routes/user.route';
import RevenueRoute from './routes/revenue.route';
import OrderRoute from './routes/order.route';
import DiscountRoute from './routes/discount.route';

const server = new App();

server.initializedRoutes([
  new UserRoute(),
  new OrderRoute(),
  new ProductRoute(),
  new RevenueRoute(),
  new DiscountRoute(),
]);
server.listen();
