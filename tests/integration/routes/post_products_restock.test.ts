import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Products } from "../../../src/data/queries/get_product_query.ts";
import type { CreateProductPayload, ProductRestockPayload } from "../../../src/routes/products.ts";
import { startServerForTesting } from "../setup.ts";

describe("POST /products/:id/restock", () => {
  let server: Awaited<ReturnType<typeof startServerForTesting>>;

  beforeEach(async () => {
    server = await startServerForTesting(8004);
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

  it("increases the product stock by the amount specified", async () => {
    const resp = await fetch(`${server.url}/products/1/restock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        <ProductRestockPayload> {
          stockAdded: 2,
        },
      ),
    });
    expect(resp.ok).toBe(true);

    const respBody = await resp.json();
    expect(respBody).toMatchObject({
      ID: 1,
      stock: 12,
    });

    const resp2 = await fetch(`${server.url}/products/1/restock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        <ProductRestockPayload> {
          stockAdded: 12,
        },
      ),
    });
    expect(resp2.ok).toBe(true);

    const respBody2 = await resp2.json();
    expect(respBody2).toMatchObject(
      <Partial<Products>> {
        ID: 1,
        stock: 24,
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
        stock: 24,
      },
    ));
  });

  it("returns a 400 when the request is incorrect", async () => {
    // negative stock offset
    const resp = await fetch(`${server.url}/products/1/restock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        <ProductRestockPayload> {
          stockAdded: -2,
        },
      ),
    });
    expect(resp.ok).toBe(false);
    expect(resp.status).toBe(400);
    expect(await resp.text()).toBe("Bad Request: stockAdded must be positive (was -2)");

    // invalid product ID
    const resp2 = await fetch(`${server.url}/products/1A/restock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        <ProductRestockPayload> {
          stockAdded: 2,
        },
      ),
    });
    expect(resp2.ok).toBe(false);
    expect(resp2.status).toBe(400);
    expect(await resp2.text()).toBe("Bad Request: incorrect URL");
  });

  it("returns 404 when a product with the specified ID does not exist", async () => {
    // product ID that does not exist
    const resp = await fetch(`${server.url}/products/999/restock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        <ProductRestockPayload> {
          stockAdded: 2,
        },
      ),
    });
    expect(resp.ok).toBe(false);
    expect(resp.status).toBe(404);
    expect(await resp.text()).toBe("Not Found");
  });
});
