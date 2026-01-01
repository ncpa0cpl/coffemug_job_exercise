import { type } from "arktype";
import express from "express";
import { CreateOrderCmd } from "../data/commands/create_order_cmd.ts";
import { GetCustomerByIDQuery } from "../data/queries/get_customer_query.ts";
import { GetAllDiscountsQuery } from "../data/queries/get_discounts_query.ts";
import { GetAllOrdersQuery, GetOrderByIDQuery } from "../data/queries/get_order_query.ts";
import { GetAllProductsByIDQuery } from "../data/queries/get_product_query.ts";
import { GetAllTaxesQuery } from "../data/queries/get_taxes_query.ts";
import { handleCommand } from "../lib/database/cmd_handler.ts";
import { handleQuery } from "../lib/database/query_handler.ts";
import { OrdersProcessor } from "../lib/orders_processor/orders_processor.ts";

export const OrdersRouter = express.Router();

export type CreateOrderPayload = typeof validateCreateOrderPayload.infer;
const validateCreateOrderPayload = type({
  customerID: "number.integer",
  selectedProducts: type({
    productID: "number.integer",
    quantity: "number.integer > 0",
  }).array(),
});

OrdersRouter.get("/order", async (req, res) => {
  const orderQuery = new GetAllOrdersQuery();
  const order = await handleQuery(orderQuery);

  return res.status(201).json(order);
});

OrdersRouter.post("/order", async (req, res) => {
  const payload = validateCreateOrderPayload(req.body);
  if (payload instanceof type.errors) {
    res.status(400).send("Bad Request: " + payload.summary);
    return;
  }
  if (payload.selectedProducts.length < 1) {
    res.status(400).send("Bad Request: order must have at least one product");
    return;
  }

  const prodQuery = new GetAllProductsByIDQuery(payload.selectedProducts.map((p) => p.productID));
  const discountsQuery = new GetAllDiscountsQuery();
  const taxesQuery = new GetAllTaxesQuery();
  const customerQuery = new GetCustomerByIDQuery(payload.customerID);

  const [products, discounts, taxes, customer] = await Promise.all([
    handleQuery(prodQuery),
    handleQuery(discountsQuery),
    handleQuery(taxesQuery),
    handleQuery(customerQuery),
  ]);

  const orderProcessor = new OrdersProcessor(products, discounts, taxes, new Date());
  const orderCalc = orderProcessor.calculateOrder(payload.selectedProducts, customer.location);

  const cmd = new CreateOrderCmd({
    total: orderCalc.total,
    subtotal: orderCalc.subtotal,
    taxTotal: orderCalc.taxTotal,
    appliedDiscountID: orderCalc.discount?.ID,
    appliedTax: orderCalc.tax?.ID,
    discountTotal: orderCalc.discountTotal,
    products: orderCalc.productTotals,
    orderedBy: payload.customerID,
  });
  const { orderID } = await handleCommand(cmd);

  const orderQuery = new GetOrderByIDQuery(orderID);
  const order = await handleQuery(orderQuery);

  return res.status(201).json(order);
});
