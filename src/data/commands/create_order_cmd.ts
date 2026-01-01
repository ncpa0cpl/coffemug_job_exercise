import type { Command } from "../../lib/database/cmd_handler.ts";
import type { SqlFunction } from "../../lib/database/database.ts";
import { ClientError } from "../../utils/client_error.ts";

type CreateOrderCmdResult = {
  orderID: number;
};

export class CreateOrderCmd implements Command<CreateOrderCmdResult> {
  private order;
  constructor(order: {
    readonly subtotal: string;
    readonly total: string;
    readonly taxTotal: string;
    readonly discountTotal: string;
    readonly appliedTax?: number;
    readonly appliedDiscountID?: number;
    readonly orderedBy: number;
    readonly products: ReadonlyArray<{
      readonly productID: number;
      readonly quantity: number;
      readonly total: string;
      readonly subtotal: string;
      readonly taxTotal: string;
      readonly discountTotal: string;
    }>;
  }) {
    this.order = order;
  }

  async act(sql: SqlFunction): Promise<CreateOrderCmdResult> {
    const { order } = this;

    const result = await sql`INSERT INTO orders (
            subtotal,
            total,
            taxTotal,
            discountTotal,
            appliedTaxID,
            appliedDiscountID,
            orderedBy
        ) VALUES (
            ${order.subtotal},
            ${order.total},
            ${order.taxTotal},
            ${order.discountTotal},
            ${order.appliedTax},
            ${order.appliedDiscountID},
            ${order.orderedBy}
        )
    `.run();

    const productIDs = order.products.map((p) => p.productID);
    const currentProductStocks = await sql`SELECT ID, stock FROM products WHERE ID IN ${productIDs}`.getAll<{
      ID: number;
      stock: number;
    }>();

    for (const orderProd of order.products) {
      const current = currentProductStocks.find((p) => p.ID === orderProd.productID);
      if (!current) throw new Error("no such product in database: " + orderProd.productID);

      const newStock = current.stock - orderProd.quantity;
      if (newStock < 0) {
        throw new ClientError(
          "order cannot be completed",
          `Unable to complete the order, insufficent stock of the item`,
          409,
        );
      }

      await sql`UPDATE products SET stock = stock - ${orderProd.quantity} WHERE ID = ${current.ID}`.run();
    }

    const orderID = Number(result.lastInsertRowid);

    await sql
      .from(
        `INSERT INTO orderProducts (orderID, productID, quantity, productSubtotal, productTotal, productTaxTotal, productDiscountTotal) VALUES `
          + order.products.map(() => `(?, ?, ?, ?, ?, ?, ?)`).join(", "),
        order.products.flatMap((p) => [
          orderID,
          p.productID,
          p.quantity,
          p.subtotal,
          p.total,
          p.taxTotal,
          p.discountTotal,
        ]),
      )
      .run();

    return { orderID };
  }
}
