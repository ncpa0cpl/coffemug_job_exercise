import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { ProductPrices, Products } from "../../../src/data/queries/get_product_query.ts";
import { startServerForTesting } from "../setup.ts";

describe("GET /products", () => {
  let server: Awaited<ReturnType<typeof startServerForTesting>>;

  beforeEach(async () => {
    server = await startServerForTesting(8001, { populateProducts: true });
  });

  afterEach(async () => {
    await server.close();
  });

  it("returns a list of all products in DB", async () => {
    const resp = await fetch(`${server.url}/products`, {
      method: "GET",
    });
    expect(resp.ok).toBe(true);

    const expectedProducts: Array<Products> = [
      {
        ID: 1,
        name: "Milk",
        description: "",
        stock: 10,
        prices: [
          expect.objectContaining({
            price: "6.64",
            type: "location_based",
            location: "Asia",
          }),
          expect.objectContaining({
            price: "6.99",
            type: "default",
            location: null,
          }),
        ],
      },
      {
        ID: 2,
        name: "Flour",
        description: "",
        stock: 10,
        prices: [
          expect.objectContaining({
            price: "3.32",
            type: "location_based",
            location: "Asia",
          }),
          expect.objectContaining({
            price: "3.50",
            type: "default",
            location: null,
          }),
        ],
      },
      {
        ID: 3,
        name: "Eggs",
        description: "",
        stock: 10,
        prices: [
          expect.objectContaining({
            price: "11.64",
            type: "location_based",
            location: "Asia",
          }),
          expect.objectContaining({
            price: "12.25",
            type: "default",
            location: null,
          }),
        ],
      },
      {
        ID: 4,
        name: "Butter",
        description: "",
        stock: 10,
        prices: [
          expect.objectContaining({
            price: "6.65",
            type: "location_based",
            location: "Asia",
          }),
          expect.objectContaining({
            price: "7.00",
            type: "default",
            location: null,
          }),
        ],
      },
      {
        ID: 5,
        name: "Bacon",
        description: "",
        stock: 10,
        prices: [
          expect.objectContaining({
            price: "16.90",
            type: "location_based",
            location: "Asia",
          }),
          expect.objectContaining({
            price: "17.79",
            type: "default",
            location: null,
          }),
        ],
      },
    ];

    const respBody = await resp.json();
    expect(respBody).toEqual(expectedProducts);
  });
});
