import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { Order } from "../../../src/data/queries/get_order_query.ts";
import type { Products } from "../../../src/data/queries/get_product_query.ts";
import type { CreateOrderPayload } from "../../../src/routes/orders.ts";
import { startServerForTesting } from "../setup.ts";

describe("POST /order", () => {
  let server: Awaited<ReturnType<typeof startServerForTesting>>;

  beforeEach(async () => {
    server = await startServerForTesting(8002, { populateProducts: true });
  });

  afterEach(async () => {
    await server.close();
  });

  it("correctly creates a new order and returns it - single item", async () => {
    const resp = await fetch(`${server.url}/order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        <CreateOrderPayload> {
          customerID: 1,
          selectedProducts: [
            {
              productID: 1,
              quantity: 1,
            },
          ],
        },
      ),
    });
    expect(resp.ok).toBe(true);

    const respBody = await resp.json();
    expect(respBody).toMatchObject(
      <Order> {
        ID: 1,
        subtotal: "6.99",
        discountTotal: "0.00",
        taxTotal: "1.05",
        total: "8.04",
        orderedBy: expect.objectContaining({
          customerID: 1,
        }),
        appliedDiscount: null,
        appliedTax: expect.objectContaining({
          taxID: 41,
        }),
        products: [{
          productDiscountTotal: "0.00",
          productSubtotal: "6.99",
          productTaxTotal: "1.05",
          productTotal: "8.04",
          productID: 1,
          quantity: 1,
        }],
      },
    );
  });

  it("correctly creates a new order and returns it - multiple items", async () => {
    const resp = await fetch(`${server.url}/order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        <CreateOrderPayload> {
          customerID: 1,
          selectedProducts: [
            {
              productID: 1,
              quantity: 2,
            },
            {
              productID: 3,
              quantity: 1,
            },
            {
              productID: 5,
              quantity: 6,
            },
          ],
        },
      ),
    });
    expect(resp.ok).toBe(true);

    const respBody = await resp.json();
    expect(respBody).toMatchObject(
      <Order> {
        ID: 1,
        subtotal: "132.97",
        discountTotal: "13.30",
        taxTotal: "19.96",
        total: "139.63",
        orderedBy: expect.objectContaining({
          customerID: 1,
        }),
        appliedDiscount: expect.objectContaining({
          discountID: 1,
        }),
        appliedTax: expect.objectContaining({
          taxID: 41,
        }),
        products: [
          {
            productDiscountTotal: "1.40",
            productSubtotal: "13.98",
            productTaxTotal: "2.10",
            productTotal: "14.68",
            productID: 1,
            quantity: 2,
          },
          {
            productDiscountTotal: "1.22",
            productSubtotal: "12.25",
            productTaxTotal: "1.84",
            productTotal: "12.87",
            productID: 3,
            quantity: 1,
          },
          {
            productDiscountTotal: "10.68",
            productSubtotal: "106.74",
            productTaxTotal: "16.02",
            productTotal: "112.08",
            productID: 5,
            quantity: 6,
          },
        ],
      },
    );
  });

  it("subtracts the ordered items from the item stocks", async () => {
    const resp = await fetch(`${server.url}/order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        <CreateOrderPayload> {
          customerID: 1,
          selectedProducts: [
            {
              productID: 1,
              quantity: 1,
            },
            {
              productID: 2,
              quantity: 5,
            },
            {
              productID: 3,
              quantity: 10,
            },
          ],
        },
      ),
    });
    expect(resp.ok).toBe(true);

    const resp2 = await fetch(`${server.url}/products`, {
      method: "GET",
    });
    expect(resp2.ok).toBe(true);

    const expectedProducts: Array<Partial<Products>> = [
      {
        ID: 1,
        stock: 9, // 10 - 1
      },
      {
        ID: 2,
        stock: 5, // 10 - 5
      },
      {
        ID: 3,
        stock: 0, // 10 - 10
      },
      {
        ID: 4,
        stock: 10,
      },
      {
        ID: 5,
        stock: 10,
      },
    ];

    const resp2Body = await resp2.json();
    expect(resp2Body).toMatchObject(expectedProducts);
  });

  it("returns 409 if the stock is insufficient to complete the order", async () => {
    const resp = await fetch(`${server.url}/order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        <CreateOrderPayload> {
          customerID: 1,
          selectedProducts: [
            {
              productID: 1,
              quantity: 11,
            },
          ],
        },
      ),
    });
    expect(resp.ok).toBe(false);
    expect(resp.status).toBe(409);
    expect(await resp.text()).toBe("Unable to complete the order, insufficent stock of the item: Milk");

    // validate the product stock has not changed
    const resp2 = await fetch(`${server.url}/products`, {
      method: "GET",
    });
    expect(resp2.ok).toBe(true);
    const resp2Body: Array<Products> = await resp2.json();
    const milk = resp2Body.find(p => p.ID === 1);
    expect(milk).toMatchObject(
      <Partial<Products>> {
        stock: 10,
      },
    );
  });
});
