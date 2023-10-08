import ProductRoute from 'routes/product.route';
import App from './app';
import UserRoute from './routes/user.route';
import GetAllOrdersRoute from 'routes/get_all_orders.route';
import GetAllDiscountRoute from 'routes/get_all_discount.route';

const server = new App();

server.initializedRoutes([new UserRoute(), new ProductRoute(), new GetAllOrdersRoute(), new GetAllDiscountRoute()]);
server.listen();
