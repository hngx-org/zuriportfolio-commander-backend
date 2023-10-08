import ProductRoute from './routes/product.route';
import App from './app';
import UserRoute from './routes/user.route';
import GetAllOrdersRoute from './routes/get_all_orders.route';
import GetAllDiscountRoute from './routes/get_all_discount.route';
import RevenueRoute from "./routes/revenew.route";
import OrderRoute from './routes/order.route';

const server = new App();

server.initializedRoutes([new UserRoute(), new OrderRoute(), new ProductRoute(), new GetAllOrdersRoute(), new GetAllDiscountRoute(), new RevenueRoute()]);
server.listen();
