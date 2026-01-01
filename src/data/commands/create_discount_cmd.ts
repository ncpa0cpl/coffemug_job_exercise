import type { Command } from "../../lib/database/cmd_handler.ts";
import type { SqlFunction } from "../../lib/database/database.ts";

type CreateDiscountCmdResult = {
  discountID: number;
};

export class CreateDiscountCmd implements Command<CreateDiscountCmdResult> {
  private discount;
  constructor(prod: {
    readonly name: string;
    readonly type: "volume" | "date";
    readonly amount: number;
    readonly minVolume?: number;
    readonly dateRangeStart?: Date;
    readonly dateRangeEnd?: Date;
  }) {
    this.discount = prod;
  }

  async act(sql: SqlFunction): Promise<CreateDiscountCmdResult> {
    const { discount } = this;
    const result = await sql`
        INSERT INTO discounts (name, type, amount, minVolume, dateRangeStart, dateRangeEnd)
        VALUES (
          ${discount.name},
          ${discount.type},
          ${discount.amount},
          ${discount.minVolume},
          ${discount.dateRangeStart},
          ${discount.dateRangeEnd}
        )
    `.run();
    return { discountID: Number(result.lastInsertRowid) };
  }
}
