import App from './app';
import UserRoute from './routes/user.route';
import ProductRoute from './routes/product.route';

const server = new App();
server.initializedRoutes([new UserRoute(), new ProductRoute()]);

server.listen();
