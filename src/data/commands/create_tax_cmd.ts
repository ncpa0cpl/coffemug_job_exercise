import type { Command } from "../../lib/database/cmd_handler.ts";
import type { SqlFunction } from "../../lib/database/database.ts";

type CreateTaxCmdResult = {
  taxID: number;
};

export class CreateTaxCmd implements Command<CreateTaxCmdResult> {
  private tax;
  constructor(tax: { readonly name: string; readonly amount: number; readonly country: string }) {
    this.tax = tax;
  }

  async act(sql: SqlFunction): Promise<CreateTaxCmdResult> {
    const { tax } = this;
    const result = await sql`
        INSERT INTO taxes (name, amount, country)
        VALUES (${tax.name}, ${tax.amount}, ${tax.country})
    `.run();
    return { taxID: Number(result.lastInsertRowid) };
  }
}
