import type { SqlFunction } from "../../lib/database/database.ts";
import type { Migration } from "../../lib/database/migrations_controller.ts";

export class CreateTablesMigration implements Migration {
  name = "create_tables";
  timestamp = 1766515316971;

  async up(sql: SqlFunction): Promise<any> {
    await sql`CREATE TABLE customers(
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        location TEXT NOT NULL
    )`.run();

    await sql`CREATE TABLE products(
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        stock INT NOT NULL CHECK(stock >= 0)
    )`.run();

    await sql`CREATE TABLE productPrices(
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        productID INT NOT NULL REFERENCES products(ID) ON DELETE CASCADE,
        price TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type in ('default','location_based')),
        location TEXT CHECK(location NOT NULL OR type = 'default')
    )`.run();

    await sql`CREATE TABLE taxes(
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        amount INT NOT NULL,
        country TEXT NOT NULL
    )`.run();

    await sql`CREATE TABLE discounts(
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type in ('volume','date')),
        minVolume INT CHECK(minVolume NOT NULL OR type != 'volume'),
        dateRangeStart DATE CHECK(dateRangeStart NOT NULL OR type != 'date'),
        dateRangeEnd DATE CHECK(dateRangeEnd NOT NULL OR type != 'date'),
        amount INT NOT NULL
    )`.run();

    await sql`CREATE TABLE orders(
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        subtotal TEXT NOT NULL,
        total TEXT NOT NULL,
        taxTotal TEXT NOT NULL,
        discountTotal TEXT NOT NULL,
        appliedTaxID INTEGER REFERENCES taxes(ID),
        appliedDiscountID INTEGER REFERENCES discounts(ID),
        orderedBy INTEGER REFERENCES customers(ID)
    )`.run();

    await sql`CREATE TABLE orderProducts(
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        orderID INT NOT NULL REFERENCES orders(ID) ON DELETE CASCADE,
        productID INT NOT NULL REFERENCES products(ID),
        quantity INT NOT NULL,
        productSubtotal TEXT NOT NULL,
        productTotal TEXT NOT NULL,
        productTaxTotal TEXT NOT NULL,
        productDiscountTotal TEXT NOT NULL
    )`.run();
  }
}
