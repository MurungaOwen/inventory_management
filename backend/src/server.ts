import "reflect-metadata";
import "@config/env";
import { container } from "tsyringe";
import { ProductsRoute } from "@routes/products.route";
import { InventoryRoute } from "@routes/inventory.route";
import { SalesRoute } from "@routes/sales.route";
import { ReportsRoute } from "@routes/reports.route";
import { NotificationsRoute } from "@routes/notifications.route";
import App from "@/app";
import { UsersRepository } from "@repositories/users.repository";
import { AuthRoute } from "@routes/auth.route";
import { UsersRoute } from "@routes/users.route";
import { ValidateEnv } from "@utils/validateEnv";

// DI
container.registerInstance(UsersRepository, new UsersRepository());

ValidateEnv();

const routes = [
  container.resolve(UsersRoute),
  container.resolve(AuthRoute),
  container.resolve(ProductsRoute),
  container.resolve(InventoryRoute),
  container.resolve(SalesRoute),
  container.resolve(ReportsRoute),
  container.resolve(NotificationsRoute),
];

// API prefix
const appInstance = new App(routes);


const server = appInstance.listen();

// Graceful Shutdown
if (server && typeof server.close === "function") {
  ["SIGINT", "SIGTERM"].forEach((signal) => {
    process.on(signal, () => {
      console.log(`Received ${signal}, closing server...`);
      server.close(() => {
        console.log("HTTP server closed gracefully");
        process.exit(0);
      });
    });
  });
}

export default server;
