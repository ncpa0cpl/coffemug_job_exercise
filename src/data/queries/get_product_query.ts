import { type SqlFunction, type SqlStatement } from "../../lib/database/database.ts";
import type { ModelJoins, Query, QueryAll } from "../../lib/database/query_handler.ts";

export class ProductPrices {
  priceID!: number;
  price!: string;
  type!: "default" | "location_based";
  location!: string;

  pk() {
    return "priceID";
  }
}

export class Products {
  ID!: number;
  name!: string;
  description!: string;
  stock!: number;
  prices: ProductPrices[] = [];
}

export class GetProductsQuery implements QueryAll<Products> {
  readonly all = true;

  constructor() {}

  model(): Products {
    return new Products();
  }

  statement(sql: SqlFunction): SqlStatement {
    return sql`
        SELECT
            products.ID, products.name, products.description, products.stock,
            productPrices.ID as priceID, productPrices.price, productPrices.type, productPrices.location
        FROM products
        LEFT JOIN productPrices ON products.ID = productPrices.productID
    `;
  }

  joins(): ModelJoins<Products> {
    return {
      prices: () => new ProductPrices(),
    };
  }
}

export class GetProductByIDQuery implements Query<Products> {
  private productID: number;
  constructor(productID: number) {
    this.productID = productID;
  }

  model(): Products {
    return new Products();
  }

  statement(sql: SqlFunction): SqlStatement {
    return sql`
        SELECT
            products.ID, products.name, products.description, products.stock,
            productPrices.ID as priceID, productPrices.price, productPrices.type, productPrices.location
        FROM products
        LEFT JOIN productPrices ON products.ID = productPrices.productID
        WHERE products.ID = ${this.productID}
    `;
  }

  joins(): ModelJoins<Products> {
    return {
      prices: () => new ProductPrices(),
    };
  }
}

export class GetAllProductsByIDQuery implements QueryAll<Products> {
  readonly all = true;

  private productIDs: number[];
  constructor(productIDs: number[]) {
    this.productIDs = productIDs;
  }

  model(): Products {
    return new Products();
  }

  statement(sql: SqlFunction): SqlStatement {
    return sql`
        SELECT
            products.ID, products.name, products.description, products.stock,
            productPrices.ID as priceID, productPrices.price, productPrices.type, productPrices.location
        FROM products
        LEFT JOIN productPrices ON products.ID = productPrices.productID
        WHERE products.ID IN ${this.productIDs}
    `;
  }

  joins(): ModelJoins<Products> {
    return {
      prices: () => new ProductPrices(),
    };
  }
}
