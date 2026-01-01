import type { Command } from "../../lib/database/cmd_handler.ts";
import type { SqlFunction } from "../../lib/database/database.ts";

type CreateCustomerCmdResult = {
  taxID: number;
};

export class CreateCustomerCmd implements Command<CreateCustomerCmdResult> {
  private customer;
  constructor(customer: { readonly username: string; readonly location: string; readonly email: string }) {
    this.customer = customer;
  }

  async act(sql: SqlFunction): Promise<CreateCustomerCmdResult> {
    const { customer } = this;
    const result = await sql`
        INSERT INTO customers (username, email, location)
        VALUES (${customer.username}, ${customer.email}, ${customer.location})
    `.run();
    return { taxID: Number(result.lastInsertRowid) };
  }
}
