import type { SqlFunction, SqlStatement } from "../../lib/database/database.ts";
import type { QueryAll } from "../../lib/database/query_handler.ts";

export class Tax {
  ID!: number;
  name!: string;
  amount!: number;
  country!: string;
}

export class GetAllTaxesQuery implements QueryAll<Tax> {
  readonly all = true;

  model(): Tax {
    return new Tax();
  }

  statement(sql: SqlFunction): SqlStatement {
    return sql`SELECT ID, name, amount, country FROM taxes`;
  }
}
