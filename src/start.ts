import express from "express";
import { CreateTablesMigration } from "./data/migrations/create_tables.ts";
import { createCustomers, createDiscounts, createProducts, createTaxes } from "./data_setups.ts";
import { globalErrorHandler } from "./error_handler.ts";
import { closeDb, initDatabase, initInMemoryDatabase } from "./lib/database/database.ts";
import { MigrationsController } from "./lib/database/migrations_controller.ts";
import { OrdersRouter } from "./routes/orders.ts";
import { ProductsRouter } from "./routes/products.ts";

process.loadEnvFile();

MigrationsController.migrations = [new CreateTablesMigration()];

if (process.env.DATABASE_FILE === ":memory:") {
  await initInMemoryDatabase();
} else {
  await initDatabase();
}

await createCustomers();
await createDiscounts();
await createTaxes();

if (process.env.POPULATE_PRODUCTS === "true") {
  await createProducts();
}

const app = express();
app.use(express.json());
app.use(ProductsRouter);
app.use(OrdersRouter);
app.use(globalErrorHandler);

const port = Number(process.env.PORT);
const server = app.listen(port);
process.on("SIGTERM", () => {
  if (server) {
    server.close();
    closeDb();
  }
});
console.log(`Server started at http://localhost:${port}`);
