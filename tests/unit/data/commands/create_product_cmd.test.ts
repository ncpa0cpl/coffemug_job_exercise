import { beforeEach, describe, expect, it } from "vitest";
import { CreateProductCmd } from "../../../../src/data/commands/create_product_cmd.ts";
import { ProductPrices, Products } from "../../../../src/data/queries/get_product_query.ts";
import { handleCommand } from "../../../../src/lib/database/cmd_handler.ts";
import { closeDb, initInMemoryDatabase, sql } from "../../../../src/lib/database/database.ts";
import { populateDBWithMockedData } from "../../mocked_data.ts";

describe("CreateProductCmd", () => {
  beforeEach(async () => {
    await closeDb();
    await initInMemoryDatabase();
    await populateDBWithMockedData();
  });

  it("inserts the product and it prices into DB", async () => {
    const cmd = new CreateProductCmd({
      name: "Pizza",
      description: "foo bar",
      basePrice: "10.00",
      stock: 25,
    });

    const result = await handleCommand(cmd);

    expect(result).toMatchObject({ productID: expect.any(Number) });

    // validate the product was inserted
    const product = await sql`SELECT * FROM products WHERE ID = ${result.productID}`.get<Products>();
    expect(product).toMatchObject({
      name: "Pizza",
      description: "foo bar",
      stock: 25,
    });

    // validate the product prices were inserted
    const productPrices = await sql`SELECT * FROM productPrices WHERE productID = ${result.productID}`.getAll<
      ProductPrices
    >();
    expect(productPrices).toContainEqual(expect.objectContaining({
      price: "10.00",
      type: "default",
      location: null,
    }));
    expect(productPrices).toContainEqual(expect.objectContaining({
      price: "9.50",
      type: "location_based",
      location: "Asia",
    }));
  });
});
