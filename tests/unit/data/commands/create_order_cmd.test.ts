import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { CreateOrderCmd } from "../../../../src/data/commands/create_order_cmd.ts";
import { GetAllDiscountsQuery } from "../../../../src/data/queries/get_discounts_query.ts";
import type { Order, OrderProduct } from "../../../../src/data/queries/get_order_query.ts";
import { GetAllProductsByIDQuery, Products } from "../../../../src/data/queries/get_product_query.ts";
import { GetAllTaxesQuery } from "../../../../src/data/queries/get_taxes_query.ts";
import { handleCommand } from "../../../../src/lib/database/cmd_handler.ts";
import { closeDb, initInMemoryDatabase, sql } from "../../../../src/lib/database/database.ts";
import { handleQuery } from "../../../../src/lib/database/query_handler.ts";
import { OrdersProcessor } from "../../../../src/lib/orders_processor/orders_processor.ts";
import { ClientError } from "../../../../src/utils/client_error.ts";
import { populateDBWithMockedData } from "../../mocked_data.ts";

describe("CreateOrderCmd", () => {
  beforeEach(async () => {
    await closeDb();
    await initInMemoryDatabase();
    await populateDBWithMockedData();
  });

  it("inserts the new order into the database", async () => {
    // before the test there should not be any orders in DB
    const allDbOrders = await sql`SELECT * FROM orders;`.getAll<Order>();
    expect(allDbOrders.length).toEqual(0);

    // fetch data necessary for order creation
    const [products, discounts, taxes] = await Promise.all([
      handleQuery(new GetAllProductsByIDQuery([1, 2, 3, 4, 5, 6])),
      handleQuery(new GetAllDiscountsQuery()),
      handleQuery(new GetAllTaxesQuery()),
    ]);

    // create a order
    const order = new OrdersProcessor(
      products,
      discounts,
      taxes,
      new Date("2025-12-30"),
    ).calculateOrder([{
      productID: 1,
      quantity: 2,
    }], "pl");

    // execute the commend
    const cmd = new CreateOrderCmd({
      total: order.total,
      discountTotal: order.discountTotal,
      orderedBy: 1,
      subtotal: order.subtotal,
      taxTotal: order.taxTotal,
      appliedDiscountID: order.discount?.ID,
      appliedTax: order.tax?.ID,
      products: order.productTotals,
    });
    const result = await handleCommand(cmd);

    expect(result).toEqual({ orderID: 1 });

    // check if the order was inserted into the DB correctly
    const dbOrder = await sql`SELECT * FROM orders WHERE ID = 1;`.get<Order>();
    expect(dbOrder).toEqual(expect.objectContaining({
      ID: 1,
      subtotal: "11.98",
      total: "13.78",
      taxTotal: "1.80",
      discountTotal: "0.00",
      appliedTaxID: 1,
      appliedDiscountID: null,
      orderedBy: 1,
    }));
  });

  it("inserts the new order products into the database", async () => {
    // before the test there should not be any orders in DB
    const allDbOrders = await sql`SELECT * FROM orders;`.getAll<Order>();
    expect(allDbOrders.length).toEqual(0);

    // fetch data necessary for order creation
    const [products, discounts, taxes] = await Promise.all([
      handleQuery(new GetAllProductsByIDQuery([1, 2, 3, 4, 5, 6])),
      handleQuery(new GetAllDiscountsQuery()),
      handleQuery(new GetAllTaxesQuery()),
    ]);

    // create a order
    const order = new OrdersProcessor(
      products,
      discounts,
      taxes,
      new Date("2025-12-30"),
    ).calculateOrder([{
      productID: 1,
      quantity: 1,
    }, {
      productID: 2,
      quantity: 2,
    }, {
      productID: 4,
      quantity: 5,
    }], "pl");

    // execute the commend
    const cmd = new CreateOrderCmd({
      total: order.total,
      discountTotal: order.discountTotal,
      orderedBy: 1,
      subtotal: order.subtotal,
      taxTotal: order.taxTotal,
      appliedDiscountID: order.discount?.ID,
      appliedTax: order.tax?.ID,
      products: order.productTotals,
    });
    const result = await handleCommand(cmd);

    expect(result).toEqual({ orderID: 1 });

    // check if the order was inserted into the DB correctly
    const dbOrderProducts = await sql`SELECT * FROM orderProducts WHERE orderID = 1;`.getAll<OrderProduct>();
    expect(dbOrderProducts.length).toEqual(3);
    expect(dbOrderProducts).toContainEqual(expect.objectContaining({
      orderID: 1,
      productID: 1,
      quantity: 1,
      productSubtotal: "5.99",
    }));
    expect(dbOrderProducts).toContainEqual(expect.objectContaining({
      orderID: 1,
      productID: 2,
      quantity: 2,
      productSubtotal: "24.50",
    }));
    expect(dbOrderProducts).toContainEqual(expect.objectContaining({
      orderID: 1,
      productID: 4,
      quantity: 5,
      productSubtotal: "39.45",
    }));
  });

  it("updates the product stock values", async () => {
    // before the test there should not be any orders in DB
    const allDbOrders = await sql`SELECT * FROM orders;`.getAll<Order>();
    expect(allDbOrders.length).toEqual(0);

    // fetch data necessary for order creation
    const [products, discounts, taxes] = await Promise.all([
      handleQuery(new GetAllProductsByIDQuery([1, 2, 3, 4, 5, 6])),
      handleQuery(new GetAllDiscountsQuery()),
      handleQuery(new GetAllTaxesQuery()),
    ]);

    expect(products.length).toEqual(6);
    expect(products[0]).toMatchObject({ ID: 1, stock: 10 });
    expect(products[1]).toMatchObject({ ID: 2, stock: 10 });

    // create a order
    const order = new OrdersProcessor(
      products,
      discounts,
      taxes,
      new Date("2025-12-30"),
    ).calculateOrder([{
      productID: 1,
      quantity: 3,
    }, {
      productID: 2,
      quantity: 10,
    }], "pl");

    // execute the commend
    const cmd = new CreateOrderCmd({
      total: order.total,
      discountTotal: order.discountTotal,
      orderedBy: 1,
      subtotal: order.subtotal,
      taxTotal: order.taxTotal,
      appliedDiscountID: order.discount?.ID,
      appliedTax: order.tax?.ID,
      products: order.productTotals,
    });
    const result = await handleCommand(cmd);

    expect(result).toEqual({ orderID: 1 });

    // check if Milk stock was decreased by 3
    const productMilk = await sql`SELECT * FROM products WHERE ID = 1;`.get<Products>();
    expect(productMilk).toMatchObject({ ID: 1, stock: 7 });

    // check if Milk stock was decreased by 3
    const productEggs = await sql`SELECT * FROM products WHERE ID = 2;`.get<Products>();
    expect(productEggs).toMatchObject({ ID: 2, stock: 0 });
  });

  it("fails if stock is insufficent and doesn't changes anything in DB", async () => {
    // before the test there should not be any orders in DB
    const allDbOrders = await sql`SELECT * FROM orders;`.getAll<Order>();
    expect(allDbOrders.length).toEqual(0);

    // fetch data necessary for order creation
    const [products, discounts, taxes] = await Promise.all([
      handleQuery(new GetAllProductsByIDQuery([1, 2, 3, 4, 5, 6])),
      handleQuery(new GetAllDiscountsQuery()),
      handleQuery(new GetAllTaxesQuery()),
    ]);

    // modify the product object in JS so that the OrderProcessor doesn't throw an error
    // as we want to test here the command itself
    const milkProd = products.find(p => {
      return p.ID === 1;
    });
    milkProd!.stock = 20;

    // create a order
    const order = new OrdersProcessor(
      products,
      discounts,
      taxes,
      new Date("2025-12-30"),
    ).calculateOrder([{
      productID: 2,
      quantity: 1,
    }, {
      productID: 1,
      quantity: 11,
    }], "pl");

    // execute the commend
    const cmd = new CreateOrderCmd({
      total: order.total,
      discountTotal: order.discountTotal,
      orderedBy: 1,
      subtotal: order.subtotal,
      taxTotal: order.taxTotal,
      appliedDiscountID: order.discount?.ID,
      appliedTax: order.tax?.ID,
      products: order.productTotals,
    });

    // command should throw an error
    await expect(handleCommand(cmd)).rejects.toEqual(
      new ClientError(
        "order cannot be completed",
        `Unable to complete the order, insufficent stock of the item`,
        409,
      ),
    );

    // check that no order was inserted into DB
    const dbOrders = await sql`SELECT * FROM orders`.getAll<Order>();
    expect(dbOrders.length).toEqual(0);

    // check that no item stock was updated
    const dbProducts = await sql`SELECT * FROM products`.getAll<Products>();
    expect(dbProducts.length).toEqual(6);
    expect(dbProducts[0]).toMatchObject({ stock: 10 });
    expect(dbProducts[1]).toMatchObject({ stock: 10 });
    expect(dbProducts[2]).toMatchObject({ stock: 10 });
    expect(dbProducts[3]).toMatchObject({ stock: 10 });
    expect(dbProducts[4]).toMatchObject({ stock: 10 });
    expect(dbProducts[5]).toMatchObject({ stock: 10 });
  });
});
