import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Products } from "../../../src/data/queries/get_product_query.ts";
import type { CreateProductPayload } from "../../../src/routes/products.ts";
import { startServerForTesting } from "../setup.ts";

describe("POST /products", () => {
  let server: Awaited<ReturnType<typeof startServerForTesting>>;

  beforeEach(async () => {
    server = await startServerForTesting(8003);
  });

  afterEach(async () => {
    await server.close();
  });

  it("correctly creates a new product and returns it", async () => {
    const resp = await fetch(`${server.url}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        <CreateProductPayload> {
          name: "Product 1",
          description: "",
          price: "10.00",
          stock: 5,
        },
      ),
    });
    expect(resp.ok).toBe(true);

    const expectedProduct: Products = {
      ID: 1,
      name: "Product 1",
      description: "",
      stock: 5,
      prices: [
        expect.objectContaining({
          price: "10.00",
          type: "default",
          location: null,
        }),
        expect.objectContaining({
          price: "9.50",
          type: "location_based",
          location: "Asia",
        }),
      ],
    };

    const respBody = await resp.json();
    expect(respBody).toMatchObject(expectedProduct);

    const resp2 = await fetch(`${server.url}/products`, { method: "GET" });
    expect(resp2.ok).toBe(true);
    const productList = await resp2.json();
    expect(productList).toEqual([expectedProduct]);
  });

  it("should return a 400 when the body is incorrect", async () => {
    // incorrect price format
    const resp = await fetch(`${server.url}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        <CreateProductPayload> {
          name: "Product 1",
          description: "",
          price: "10,00",
          stock: 5,
        },
      ),
    });
    expect(resp.ok).toBe(false);
    expect(resp.status).toBe(400);
    expect(await resp.text()).toBe("Bad Request: price must be a well-formed numeric string (was \"10,00\")");

    // incorrect stock format
    const resp2 = await fetch(`${server.url}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        {
          name: "Product 1",
          description: "",
          price: "10.00",
          stock: "a",
        },
      ),
    });
    expect(resp2.ok).toBe(false);
    expect(resp2.status).toBe(400);
    expect(await resp2.text()).toBe("Bad Request: stock must be a number (was a string)");

    // negative price
    const resp3 = await fetch(`${server.url}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        <CreateProductPayload> {
          name: "Product 1",
          description: "",
          price: "-10.00",
          stock: 10,
        },
      ),
    });
    expect(resp3.ok).toBe(false);
    expect(resp3.status).toBe(400);
    expect(await resp3.text()).toBe("Bad Request: price cannot be negative");
  });
});
