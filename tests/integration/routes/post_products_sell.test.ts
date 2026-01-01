import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Products } from "../../../src/data/queries/get_product_query.ts";
import type { CreateProductPayload, ProductSellPayload } from "../../../src/routes/products.ts";
import { startServerForTesting } from "../setup.ts";

describe("POST /products/:id/sell", () => {
  let server: Awaited<ReturnType<typeof startServerForTesting>>;

  beforeEach(async () => {
    server = await startServerForTesting(8005);
    const resp = await fetch(`${server.url}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        <CreateProductPayload> {
          name: "Some Prod",
          description: "",
          price: "12.99",
          stock: 10,
        },
      ),
    });
    if (!resp.ok) {
      throw new Error("HTTP Error: " + resp.statusText);
    }
  });

  afterEach(async () => {
    await server.close();
  });

  it("decreases the product stock by the amount specified", async () => {
    const resp = await fetch(`${server.url}/products/1/sell`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        <ProductSellPayload> {
          stockSubtracted: 2,
        },
      ),
    });
    expect(resp.ok).toBe(true);

    const respBody = await resp.json();
    expect(respBody).toMatchObject(
      <Partial<Products>> {
        ID: 1,
        stock: 8,
      },
    );

    const resp2 = await fetch(`${server.url}/products/1/sell`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        <ProductSellPayload> {
          stockSubtracted: 8,
        },
      ),
    });
    expect(resp2.ok).toBe(true);

    const respBody2 = await resp2.json();
    expect(respBody2).toMatchObject(
      <Partial<Products>> {
        ID: 1,
        stock: 0,
      },
    );

    const resp3 = await fetch(`${server.url}/products`, {
      method: "GET",
    });
    expect(resp3.ok).toBe(true);
    const respBody3 = await resp3.json();
    expect(respBody3).toContainEqual(expect.objectContaining(
      <Partial<Products>> {
        ID: 1,
        stock: 0,
      },
    ));
  });

  it("returns a 400 when the request is incorrect", async () => {
    // negative stock offset
    const resp = await fetch(`${server.url}/products/1/sell`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        <ProductSellPayload> {
          stockSubtracted: -2,
        },
      ),
    });
    expect(resp.ok).toBe(false);
    expect(resp.status).toBe(400);
    expect(await resp.text()).toBe("Bad Request: stockSubtracted must be positive (was -2)");

    // invalid product ID
    const resp2 = await fetch(`${server.url}/products/1A/sell`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        <ProductSellPayload> {
          stockSubtracted: 2,
        },
      ),
    });
    expect(resp2.ok).toBe(false);
    expect(resp2.status).toBe(400);
    expect(await resp2.text()).toBe("Bad Request: incorrect URL");
  });

  it("returns a 400 if the stock would go below zero", async () => {
    // negative stock offset
    const resp = await fetch(`${server.url}/products/1/sell`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        <ProductSellPayload> {
          stockSubtracted: 11,
        },
      ),
    });
    expect(resp.ok).toBe(false);
    expect(resp.status).toBe(400);
    expect(await resp.text()).toBe("Bad Request: insufficient stock");
  });

  it("returns 404 when a product with the specified ID does not exist", async () => {
    // product ID that does not exist
    const resp = await fetch(`${server.url}/products/999/sell`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        <ProductSellPayload> {
          stockSubtracted: 2,
        },
      ),
    });
    expect(resp.ok).toBe(false);
    expect(resp.status).toBe(404);
    expect(await resp.text()).toBe("Not Found");
  });
});
