import { type } from "arktype";
import express from "express";
import { CreateProductCmd } from "../data/commands/create_product_cmd.ts";
import { UpdateProductStockCmd } from "../data/commands/update_product_cmd.ts";
import { GetProductByIDQuery, GetProductsQuery } from "../data/queries/get_product_query.ts";
import { handleCommand } from "../lib/database/cmd_handler.ts";
import { handleQuery } from "../lib/database/query_handler.ts";

export const ProductsRouter = express.Router();

ProductsRouter.get("/products", async (_, res) => {
  const q = new GetProductsQuery();
  const product = await handleQuery(q);
  res.json(product);
});

export type CreateProductPayload = typeof validateProductPostPayload.infer;
const validateProductPostPayload = type({
  name: "string",
  description: "string",
  price: "string.numeric",
  stock: "number.integer > 0",
});

ProductsRouter.post("/products", async (req, res) => {
  const payload = validateProductPostPayload(req.body);
  if (payload instanceof type.errors) {
    res.status(400).send("Bad Request: " + payload.summary);
    return;
  }

  if (payload.name.length > 50) {
    res.status(400).send("Bad Request: name is too long (max length: 50 characters)");
    return;
  }

  if (payload.description.length > 50) {
    res.status(400).send("Bad Request: description is too long (max length: 50 characters)");
    return;
  }

  if (payload.price.length > 50) {
    res.status(400).send("Bad Request: price is too long (max length: 50 characters)");
    return;
  }

  const price = Number(payload.price);
  if (price < 0) {
    res.status(400).send("Bad Request: price cannot be negative");
    return;
  }

  const cmd = new CreateProductCmd({
    name: payload.name,
    description: payload.description,
    stock: payload.stock,
    basePrice: payload.price,
  });
  const { productID } = await handleCommand(cmd);

  const q = new GetProductByIDQuery(productID);
  const product = await handleQuery(q);
  res.status(201).json(product);
});

export type ProductRestockPayload = typeof validateProductRestockPayload.infer;
const validateProductRestockPayload = type({
  stockAdded: "number.integer > 0",
});

ProductsRouter.post("/products/:id/restock", async (req, res) => {
  const productID = Number(req.params.id);
  if (Number.isNaN(productID)) {
    res.status(400).send("Bad Request: incorrect URL");
  }

  const payload = validateProductRestockPayload(req.body);
  if (payload instanceof type.errors) {
    res.status(400).send("Bad Request: " + payload.summary);
    return;
  }

  const cmd = new UpdateProductStockCmd(productID, payload.stockAdded);
  await handleCommand(cmd);

  const q = new GetProductByIDQuery(productID);
  const product = await handleQuery(q);
  res.status(200).json(product);
});

export type ProductSellPayload = typeof validateProductSellPayload.infer;
const validateProductSellPayload = type({
  stockSubtracted: "number.integer > 0",
});

ProductsRouter.post("/products/:id/sell", async (req, res) => {
  const productID = Number(req.params.id);
  if (Number.isNaN(productID)) {
    res.status(400).send("Bad Request: incorrect URL");
  }

  const payload = validateProductSellPayload(req.body);
  if (payload instanceof type.errors) {
    res.status(400).send("Bad Request: " + payload.summary);
    return;
  }

  const cmd = new UpdateProductStockCmd(productID, -1 * payload.stockSubtracted);
  await handleCommand(cmd);

  const q = new GetProductByIDQuery(productID);
  const product = await handleQuery(q);
  res.status(200).json(product);
});
