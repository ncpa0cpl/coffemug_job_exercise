import type { Command } from "../../lib/database/cmd_handler.ts";
import type { SqlFunction } from "../../lib/database/database.ts";
import { ClientError } from "../../utils/client_error.ts";

export class UpdateProductStockCmd implements Command {
  private productID: number;
  private stockOffset: number;
  constructor(productID: number, stockOffset: number) {
    this.productID = productID;
    this.stockOffset = stockOffset;
  }

  async act(sql: SqlFunction): Promise<void> {
    const { stockOffset, productID } = this;

    const { stock } = await sql`SELECT stock FROM products WHERE ID = ${productID}`.get<{ stock: number }>();

    const newStock = stock + stockOffset;
    if (newStock < 0) {
      throw new ClientError("unable to update the stock", "Bad Request: insufficient stock", 400);
    }

    await sql`UPDATE products SET stock = stock + ${stockOffset} WHERE ID = ${productID}`.run();
  }
}
