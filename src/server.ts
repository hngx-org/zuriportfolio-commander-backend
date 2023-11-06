import ProductRoute from './routes/product.route';
import App from './app';
import UserRoute from './routes/user.route';
import RevenueRoute from './routes/revenue.route';
import OrderRoute from './routes/order.route';
import DiscountRoute from './routes/discount.route';
import ShopRoute from './routes/shop.route';
import SalesRoute from './routes/sales.route';
import ActivitiesRoute from './routes/activity.route';

const server = new App();

server.initializedRoutes([
  new UserRoute(),
  new OrderRoute(),
  new ProductRoute(),
  new RevenueRoute(),
  new DiscountRoute(),
  new ShopRoute(),
  new SalesRoute(),
  new ActivitiesRoute(),
]);
server.listen();
