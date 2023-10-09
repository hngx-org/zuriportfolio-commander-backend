import App from "./app";
import UserRoute from "./routes/user.route";
import RevenueRoute from "./routes/revenue.route";

const server = new App();
server.initializedRoutes([new UserRoute(), new RevenueRoute()]);
server.listen();
