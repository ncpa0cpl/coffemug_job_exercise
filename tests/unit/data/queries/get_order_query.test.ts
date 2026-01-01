import { beforeEach, describe, expect, it } from "vitest";
import { CreateOrderCmd } from "../../../../src/data/commands/create_order_cmd.ts";
import { GetCustomerByIDQuery } from "../../../../src/data/queries/get_customer_query.ts";
import { GetAllDiscountsQuery } from "../../../../src/data/queries/get_discounts_query.ts";
import { GetAllOrdersQuery, GetOrderByIDQuery } from "../../../../src/data/queries/get_order_query.ts";
import { GetAllProductsByIDQuery } from "../../../../src/data/queries/get_product_query.ts";
import { GetAllTaxesQuery } from "../../../../src/data/queries/get_taxes_query.ts";
import { handleCommand } from "../../../../src/lib/database/cmd_handler.ts";
import { closeDb, initInMemoryDatabase, sql } from "../../../../src/lib/database/database.ts";
import { handleQuery } from "../../../../src/lib/database/query_handler.ts";
import { OrdersProcessor } from "../../../../src/lib/orders_processor/orders_processor.ts";
import { SqlGetError } from "../../../../src/utils/sql_get_error.ts";
import { populateDBWithMockedData } from "../../mocked_data.ts";

async function createSampleOrders() {
  const [products, discounts, taxes, customer] = await Promise.all([
    handleQuery(new GetAllProductsByIDQuery([1, 2, 3, 4, 5, 6])),
    handleQuery(new GetAllDiscountsQuery()),
    handleQuery(new GetAllTaxesQuery()),
    handleQuery(new GetCustomerByIDQuery(1)),
  ]);

  const orderProcessor = new OrdersProcessor(products, discounts, taxes, new Date("2025-12-30"));

  // Create first order
  const order1Calc = orderProcessor.calculateOrder(
    [
      { productID: 1, quantity: 2 },
      { productID: 3, quantity: 1 },
    ],
    customer.location,
  );
  const cmd1 = new CreateOrderCmd({
    total: order1Calc.total,
    subtotal: order1Calc.subtotal,
    taxTotal: order1Calc.taxTotal,
    appliedDiscountID: order1Calc.discount?.ID,
    appliedTax: order1Calc.tax?.ID,
    discountTotal: order1Calc.discountTotal,
    products: order1Calc.productTotals,
    orderedBy: customer.ID,
  });
  await handleCommand(cmd1);

  // Create second order
  const order2Calc = orderProcessor.calculateOrder(
    [{ productID: 2, quantity: 1 }],
    customer.location,
  );
  const cmd2 = new CreateOrderCmd({
    total: order2Calc.total,
    subtotal: order2Calc.subtotal,
    taxTotal: order2Calc.taxTotal,
    appliedDiscountID: order2Calc.discount?.ID,
    appliedTax: order2Calc.tax?.ID,
    discountTotal: order2Calc.discountTotal,
    products: order2Calc.productTotals,
    orderedBy: customer.ID,
  });
  await handleCommand(cmd2);
}

describe("Order Queries", () => {
  beforeEach(async () => {
    await closeDb();
    await initInMemoryDatabase();
    await populateDBWithMockedData();
    await createSampleOrders();
  });

  describe("GetOrderByIDQuery", () => {
    it("should return an order by its ID with the joined table", async () => {
      const order = await handleQuery(new GetOrderByIDQuery(1));

      expect(order).not.toBeNull();
      expect(order.ID).toBe(1);
      expect(order.orderedBy).toMatchObject({ customerID: 1 });
      expect(order.products).toHaveLength(2);
      expect(order.products).toContainEqual(
        expect.objectContaining({
          productID: 1,
          quantity: 2,
        }),
      );
      expect(order.products).toContainEqual(
        expect.objectContaining({
          productID: 3,
          quantity: 1,
        }),
      );
      expect(order.appliedDiscount).toMatchObject({
        discountID: 1,
        type: "volume",
        minVolume: 3,
        discountAmount: 10,
      });
      expect(order.appliedTax).toMatchObject({
        taxID: 1,
        name: "15% VAT",
        country: "pl",
        amount: 15,
      });
    });

    it("should throw if order is not found", async () => {
      await expect(handleQuery(new GetOrderByIDQuery(999))).rejects.instanceOf(SqlGetError);
    });
  });

  describe("GetAllOrdersQuery", () => {
    it("should return all orders", async () => {
      const orders = await handleQuery(new GetAllOrdersQuery());

      expect(orders).toHaveLength(2);
      expect(orders).toContainEqual(expect.objectContaining({
        ID: 1,
      }));
      expect(orders).toContainEqual(expect.objectContaining({
        ID: 2,
      }));

      // all entries should contain the joined products
      const order1 = orders.find(o => o.ID === 1)!;
      expect(order1.products.length).toBe(2);
      expect(order1.products).toContainEqual(expect.objectContaining({
        productID: 1,
        quantity: 2,
      }));
      expect(order1.products).toContainEqual(expect.objectContaining({
        productID: 3,
        quantity: 1,
      }));
      expect(order1.appliedDiscount).toMatchObject({
        discountID: 1,
        type: "volume",
        minVolume: 3,
        discountAmount: 10,
      });
      expect(order1.appliedTax).toMatchObject({
        taxID: 1,
        name: "15% VAT",
        country: "pl",
        amount: 15,
      });

      const order2 = orders.find(o => o.ID === 2)!;
      expect(order2.products.length).toBe(1);
      expect(order2.products).toContainEqual(expect.objectContaining({
        productID: 2,
        quantity: 1,
      }));
      expect(order2.appliedDiscount).toBe(null);
      expect(order2.appliedTax).toMatchObject({
        taxID: 1,
        name: "15% VAT",
        country: "pl",
        amount: 15,
      });
    });

    it("should return empty array if there is no orders", async () => {
      await sql`DELETE FROM orders;`.run();

      const orders = await handleQuery(new GetAllOrdersQuery());

      expect(orders).toHaveLength(0);
    });
  });
});
