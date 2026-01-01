import Decimal from "big.js";
import type { Command } from "../../lib/database/cmd_handler.ts";
import type { SqlFunction } from "../../lib/database/database.ts";

type CreateProductCmdResult = {
  productID: number;
};

export class CreateProductCmd implements Command<CreateProductCmdResult> {
  private prod;
  constructor(prod: {
    readonly name: string;
    readonly description: string;
    readonly stock: number;
    readonly basePrice: string;
  }) {
    this.prod = prod;
  }

  async act(sql: SqlFunction): Promise<CreateProductCmdResult> {
    const { prod } = this;

    const result = await sql`
        INSERT INTO products (name, description, stock)
        VALUES (${prod.name}, ${prod.description}, ${prod.stock})
    `.run();

    const productID = Number(result.lastInsertRowid);

    const asianPricing = new Decimal(prod.basePrice).mul(0.95).round(2, Decimal.roundHalfEven).toFixed(2);
    await sql`INSERT INTO productPrices (productID, price, type, location) VALUES
                (${productID}, ${prod.basePrice}, 'default', NULL),
                (${productID}, ${asianPricing}, 'location_based', 'Asia')
    `.run();

    return { productID: Number(result.lastInsertRowid) };
  }
}
