import type { SqlFunction, SqlStatement } from "../../lib/database/database.ts";
import type { Query } from "../../lib/database/query_handler.ts";

export class Customer {
  ID!: number;
  username!: string;
  email!: string;
  location!: string;
}

export class GetCustomerByIDQuery implements Query<Customer> {
  private userID: number;
  constructor(userID: number) {
    this.userID = userID;
  }

  model(): Customer {
    return new Customer();
  }

  statement(sql: SqlFunction): SqlStatement {
    const { userID } = this;
    return sql`SELECT ID, email, username, location FROM customers WHERE ID = ${userID}`;
  }
}
