import type { SqlFunction, SqlStatement } from "../../lib/database/database.ts";
import type { ModelJoins, Query, QueryAll } from "../../lib/database/query_handler.ts";

export class OrderProduct {
  productID!: number;
  quantity!: number;
  productTotal!: string;
  productSubtotal!: string;
  productTaxTotal!: string;
  productDiscountTotal!: string;

  pk() {
    return "productID";
  }
}

export class OrderedByCustomer {
  customerID!: string;
  email!: string;
  username!: string;
  location!: string;

  pk() {
    return "customerID";
  }
}

export class OrderAppliedTax {
  taxID!: string;
  name!: string;
  amount!: number;
  country!: string;

  pk() {
    return "taxID";
  }
}

export class OrderAppliedDiscount {
  discountID!: string;
  type!: "volume" | "date";
  discountAmount!: number;
  minVolume!: number | null;
  dateRangeStart!: string | null;
  dateRangeEnd!: string | null;

  pk() {
    return "discountID";
  }
}

export class Order {
  ID!: number;
  subtotal!: string;
  total!: string;
  taxTotal!: string;
  discountTotal!: string;
  appliedTax!: OrderAppliedTax | null;
  appliedDiscount!: OrderAppliedDiscount | null;
  products: OrderProduct[] = [];
  orderedBy!: OrderedByCustomer;
}

export class GetOrderByIDQuery implements Query<Order> {
  private orderID: number;
  constructor(orderID: number) {
    this.orderID = orderID;
  }

  model(): Order {
    return new Order();
  }

  statement(sql: SqlFunction): SqlStatement {
    const { orderID } = this;
    return sql`
        SELECT
            o.ID, o.subtotal, o.total, o.taxTotal, o.discountTotal, o.appliedTaxID, o.appliedDiscountID,
            p.productID, p.quantity, p.productTotal, p.productSubtotal, p.productTaxTotal, p.productDiscountTotal,
            c.ID as customerID, c.email, c.username, c.location,
            t.ID as taxID, t.name, t.amount, t.country,
            d.ID as discountID, d.type, d.amount as discountAmount, d.minVolume, d.dateRangeStart, d.dateRangeEnd
        FROM orders o
        LEFT JOIN orderProducts p ON o.ID = p.orderID
        LEFT JOIN customers c ON o.orderedBy = c.ID
        LEFT JOIN taxes t ON o.appliedTaxID = t.ID
        LEFT JOIN discounts d ON o.appliedDiscountID = d.ID
        WHERE o.ID = ${orderID}
    `;
  }

  joins(): ModelJoins<Order> {
    return {
      products: () => new OrderProduct(),
      orderedBy: () => new OrderedByCustomer(),
      appliedTax: () => new OrderAppliedTax(),
      appliedDiscount: () => new OrderAppliedDiscount(),
    };
  }
}

export class GetAllOrdersQuery implements QueryAll<Order> {
  readonly all = true;

  model(): Order {
    return new Order();
  }

  statement(sql: SqlFunction): SqlStatement {
    return sql`
        SELECT
            o.ID, o.subtotal, o.total, o.taxTotal, o.discountTotal, o.appliedTaxID, o.appliedDiscountID,
            p.productID, p.quantity, p.productTotal, p.productSubtotal, p.productTaxTotal, p.productDiscountTotal,
            c.ID as customerID, c.email, c.username, c.location,
            t.ID as taxID, t.name, t.amount, t.country,
            d.ID as discountID, d.type, d.amount as discountAmount, d.minVolume, d.dateRangeStart, d.dateRangeEnd
        FROM orders o
        LEFT JOIN orderProducts p ON o.ID = p.orderID
        LEFT JOIN customers c ON o.orderedBy = c.ID
        LEFT JOIN taxes t ON o.appliedTaxID = t.ID
        LEFT JOIN discounts d ON o.appliedDiscountID = d.ID
    `;
  }

  joins(): ModelJoins<Order> {
    return {
      products: () => new OrderProduct(),
      orderedBy: () => new OrderedByCustomer(),
      appliedTax: () => new OrderAppliedTax(),
      appliedDiscount: () => new OrderAppliedDiscount(),
    };
  }
}
