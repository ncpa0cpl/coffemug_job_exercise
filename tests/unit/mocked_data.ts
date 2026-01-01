import { transaction } from "../../src/lib/database/database.ts";

export async function populateDBWithMockedData() {
  await transaction(async (sql) => {
    await sql`
      INSERT INTO customers (username, email, location)
        VALUES
            ('Jan Kowalski', 'jankowal253@wp.pl', 'pl'),
            ('Mou Cheng', 'moucheng89345@mail.to', 'cn');
      `.run();

    await sql`
      INSERT INTO products (name, description, stock)
        VALUES
            ('Milk', '', 10),
            ('Eggs', '', 10),
            ('Butter', '', 10),
            ('Chocolate', '', 10),
            ('Salt', '', 10),
            ('Flour', '', 10);
      `.run();

    await sql`
      INSERT INTO productPrices (productID, price, type, location)
        VALUES
            (1, '5.99', 'default', NULL),
            (1, '5.70', 'location_based', 'Asia'),
            (2, '12.25', 'default', NULL),
            (2, '12.00', 'location_based', 'Asia'),
            (3, '3.55', 'default', NULL),
            (3, '3.20', 'location_based', 'Asia'),
            (4, '7.89', 'default', NULL),
            (4, '7.50', 'location_based', 'Asia'),
            (5, '2.00', 'default', NULL),
            (5, '1.80', 'location_based', 'Asia'),
            (6, '1.99', 'default', NULL),
            (6, '1.70', 'location_based', 'Asia');
      `.run();

    await sql`
      INSERT INTO taxes (name, amount, country)
        VALUES
            ('15% VAT', 15, 'pl'),
            ('15% VAT', 15, 'ge'),
            ('15% VAT', 15, 'fr'),
            ('15% VAT', 15, 'gb');
      `.run();

    await sql`
      INSERT INTO discounts
        (name, type, minVolume, dateRangeStart, dateRangeEnd, amount)
        VALUES
            ('10% off', 'volume', 3, NULL, NULL, 10),
            ('20% off', 'volume', 5, NULL, NULL, 20),
            ('30% off', 'date', NULL, '1970-01-01 00:00:00', '1970-01-01 23:59:59', 30),
            ('40% off', 'date', NULL, '1970-01-06 00:00:00', '1970-01-06 23:59:59', 40);
      `.run();
  });
}
