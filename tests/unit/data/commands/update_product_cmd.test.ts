import { beforeEach, describe, expect, it } from "vitest";
import { UpdateProductStockCmd } from "../../../../src/data/commands/update_product_cmd.ts";
import { Products } from "../../../../src/data/queries/get_product_query.ts";
import { handleCommand } from "../../../../src/lib/database/cmd_handler.ts";
import { closeDb, initInMemoryDatabase, sql } from "../../../../src/lib/database/database.ts";
import { ClientError } from "../../../../src/utils/client_error.ts";
import { populateDBWithMockedData } from "../../mocked_data.ts";

describe("UpdateProductStockCmd", () => {
  beforeEach(async () => {
    await closeDb();
    await initInMemoryDatabase();
    await populateDBWithMockedData();
  });

  it("changes the stock value of a product in DB", async () => {
    // stock should be a 10 at the start
    let milk = await sql`SELECT * FROM products WHERE ID = 1`.get<Products>();
    expect(milk.stock).toEqual(10);

    await handleCommand(new UpdateProductStockCmd(1, -2));

    // stock should have been reduced by 2
    milk = await sql`SELECT * FROM products WHERE ID = 1`.get<Products>();
    expect(milk.stock).toEqual(8);

    await handleCommand(new UpdateProductStockCmd(1, 10));

    // stock should have been incresed by 10
    milk = await sql`SELECT * FROM products WHERE ID = 1`.get<Products>();
    expect(milk.stock).toEqual(18);
  });

  it("fails and doesn't change the DB if the stock were to go below zero", async () => {
    // stock should be a 10 at the start
    let milk = await sql`SELECT * FROM products WHERE ID = 1`.get<Products>();
    expect(milk.stock).toEqual(10);

    await expect(handleCommand(new UpdateProductStockCmd(1, -11))).rejects.toEqual(
      new ClientError("unable to update the stock", "Bad Request: insufficient stock", 400),
    );

    // stock should remain as it was before
    milk = await sql`SELECT * FROM products WHERE ID = 1`.get<Products>();
    expect(milk.stock).toEqual(10);
  });
});
