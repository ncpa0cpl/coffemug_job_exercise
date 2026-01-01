import { ContinentCodes } from "@brixtol/country-continent";
import { CreateCustomerCmd } from "./data/commands/create_customer_cmd.ts";
import { CreateDiscountCmd } from "./data/commands/create_discount_cmd.ts";
import { CreateProductCmd } from "./data/commands/create_product_cmd.ts";
import { CreateTaxCmd } from "./data/commands/create_tax_cmd.ts";
import { handleCommand } from "./lib/database/cmd_handler.ts";
import { sql } from "./lib/database/database.ts";

export async function createDiscounts() {
  const { dicsountCount } = await sql`SELECT COUNT(*) as dicsountCount FROM discounts`.get<{
    dicsountCount: number;
  }>();

  if (dicsountCount > 0) {
    return;
  }

  await handleCommand(
    new CreateDiscountCmd({
      name: "-10% on 5 or more",
      type: "volume",
      amount: 10,
      minVolume: 5,
    }),
  );
  await handleCommand(
    new CreateDiscountCmd({
      name: "-20% on 10 or more",
      type: "volume",
      amount: 20,
      minVolume: 10,
    }),
  );
  await handleCommand(
    new CreateDiscountCmd({
      name: "-30% on 50 or more",
      type: "volume",
      amount: 30,
      minVolume: 50,
    }),
  );
  if (process.env.ADD_DATE_BASED_DISCOUNTS === "true") {
    await handleCommand(
      new CreateDiscountCmd({
        name: "Black Friday Sale",
        type: "date",
        amount: 25,
        dateRangeStart: new Date("1970-01-06T00:00:00Z"),
        dateRangeEnd: new Date("1970-01-06T23:59:59Z"),
      }),
    );

    await handleCommand(
      new CreateDiscountCmd({
        name: "Holiday Sales",
        type: "date",
        amount: 15,
        dateRangeStart: new Date("1970-01-01T00:00:00Z"),
        dateRangeEnd: new Date("1970-01-01T23:59:59Z"),
      }),
    );
  }
}

export async function createTaxes() {
  const { taxesCount } = await sql`SELECT COUNT(*) as taxesCount FROM taxes`.get<{
    taxesCount: number;
  }>();

  if (taxesCount > 0) {
    return;
  }

  // create a 15% VAT tax for each European country
  for (const [countryCode, continentCode] of Object.entries(ContinentCodes)) {
    if (continentCode === "EU") {
      await handleCommand(
        new CreateTaxCmd({
          name: "VAT",
          amount: 15,
          country: countryCode.toLowerCase(),
        }),
      );
    }
  }
}

export async function createCustomers() {
  const { customerCount } = await sql`SELECT COUNT(*) as customerCount FROM customers`.get<{
    customerCount: number;
  }>();

  if (customerCount > 0) {
    return;
  }

  await handleCommand(
    new CreateCustomerCmd({
      username: "Szymon",
      location: "pl",
      email: "szymonb21@gmail.com",
    }),
  );

  await handleCommand(
    new CreateCustomerCmd({
      username: "Xin",
      location: "cn",
      email: "xin12345667@gmail.com",
    }),
  );
}

export async function createProducts() {
  const { productCount } = await sql`SELECT COUNT(*) as productCount FROM products`.get<{
    productCount: number;
  }>();

  if (productCount > 0) {
    return;
  }

  await handleCommand(
    new CreateProductCmd({
      name: "Milk",
      description: "",
      basePrice: "6.99",
      stock: 10,
    }),
  );

  await handleCommand(
    new CreateProductCmd({
      name: "Flour",
      description: "",
      basePrice: "3.50",
      stock: 10,
    }),
  );

  await handleCommand(
    new CreateProductCmd({
      name: "Eggs",
      description: "",
      basePrice: "12.25",
      stock: 10,
    }),
  );

  await handleCommand(
    new CreateProductCmd({
      name: "Butter",
      description: "",
      basePrice: "7.00",
      stock: 10,
    }),
  );

  await handleCommand(
    new CreateProductCmd({
      name: "Bacon",
      description: "",
      basePrice: "17.79",
      stock: 10,
    }),
  );
}
