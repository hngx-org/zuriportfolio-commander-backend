import App from './app';
import UserRoute from './routes/user.route';
import CreateDiscountRoute from './routes/createDiscount.route';

const server = new App();
server.initializedRoutes([new UserRoute(), new CreateDiscountRoute()]);
server.listen();
