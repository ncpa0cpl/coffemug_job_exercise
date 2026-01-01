import type { SqlFunction, SqlStatement } from "../../lib/database/database.ts";
import type { QueryAll } from "../../lib/database/query_handler.ts";

export class Discount {
  ID!: number;
  name!: string;
  type!: "volume" | "date";
  amount!: number;
  minVolume!: number | null;
  dateRangeStart!: Date | null;
  dateRangeEnd!: Date | null;
}

export class GetAllDiscountsQuery implements QueryAll<Discount> {
  readonly all = true;

  model(): Discount {
    return new Discount();
  }

  statement(sql: SqlFunction): SqlStatement {
    return sql`SELECT ID, name, type, amount, minVolume, dateRangeStart, dateRangeEnd FROM discounts`;
  }
}
