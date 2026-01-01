import { getContinentName } from "@brixtol/country-continent";
import Decimal from "big.js";
import { Discount } from "../../data/queries/get_discounts_query.ts";
import { ProductPrices, type Products } from "../../data/queries/get_product_query.ts";
import type { Tax } from "../../data/queries/get_taxes_query.ts";
import { assertDefined } from "../../utils/assert.ts";
import { ClientError } from "../../utils/client_error.ts";

export type ProcessedOrder = {
  total: string;
  subtotal: string;
  taxTotal: string;
  discountTotal: string;
  tax?: Tax;
  discount?: Discount;
  productTotals: Array<{
    productID: number;
    quantity: number;
    total: string;
    subtotal: string;
    taxTotal: string;
    discountTotal: string;
  }>;
};

type SelectedProduct = { productID: number; quantity: number };

export class OrdersProcessor {
  products;
  discounts;
  taxes;
  date;
  constructor(products: Products[], discounts: Discount[], taxes: Tax[], date: Date) {
    this.products = products;
    this.discounts = discounts;
    this.taxes = taxes;
    this.date = date;
  }

  private validateStockAvailability(selectedProduct: SelectedProduct, product: Products) {
    if (selectedProduct.quantity > product.stock) {
      throw new ClientError(
        "order cannot be completed",
        `Unable to complete the order, insufficent stock of the item: ${product.name}`,
        409,
      );
    }
  }

  private resolveOrderVolume(selectedProducts: SelectedProduct[]) {
    return selectedProducts.reduce((sum, prod) => sum + prod.quantity, 0);
  }

  private resolvePrice(prod: Products, location: string): ProductPrices {
    const continent = getContinentName(location);

    let defaultPrice: ProductPrices | undefined;
    for (const price of prod.prices) {
      if (price.type === "default") {
        defaultPrice = price;
      } else {
        if (price.location === continent) {
          return price;
        }
      }
    }

    if (defaultPrice == null) {
      throw new Error("product has no default price");
    }

    return defaultPrice;
  }

  private resolveTax(location: string): Tax | undefined {
    for (const tax of this.taxes) {
      if (tax.country.toLowerCase() === location.toLowerCase()) {
        return tax;
      }
    }
    return undefined;
  }

  private isDiscountRequirementMet(discount: Discount, orderVolume: number) {
    switch (discount.type) {
      case "date": {
        assertDefined(discount.dateRangeStart);
        assertDefined(discount.dateRangeEnd);

        const start = new Date(discount.dateRangeStart);
        const end = new Date(discount.dateRangeEnd);

        start.setFullYear(this.date.getFullYear());
        end.setFullYear(this.date.getFullYear());

        return this.date >= start && this.date <= end;
      }
      case "volume":
        assertDefined(discount.minVolume);
        return orderVolume >= discount.minVolume;
    }
  }

  private resolveDiscount(orderVolume: number): Discount | undefined {
    let finalDiscount: Discount | undefined;

    for (const discount of this.discounts) {
      if (this.isDiscountRequirementMet(discount, orderVolume)) {
        if (!finalDiscount || discount.amount > finalDiscount.amount) {
          finalDiscount = discount;
        }
      }
    }

    return finalDiscount;
  }

  private calculateItemTaxes(unitPrice: Decimal, tax?: Tax): Decimal {
    if (!tax) return new Decimal(0);

    const taxPercent = new Decimal(tax.amount).div(100);
    const taxAmount = unitPrice.times(taxPercent);
    return taxAmount.round(2, Decimal.roundHalfEven);
  }

  private calculateItemDiscounts(unitPrice: Decimal, discount?: Discount): Decimal {
    if (!discount) return new Decimal(0);

    const discountPercent = new Decimal(discount.amount).div(100);
    const discountedAmount = unitPrice.times(discountPercent);
    return discountedAmount.round(2, Decimal.roundHalfEven);
  }

  calculateOrder(selectedProducts: SelectedProduct[], location: string): ProcessedOrder {
    const tax = this.resolveTax(location);

    const productTotals: Array<{
      id: number;
      total: Decimal;
      subtotal: Decimal;
      taxTotal: Decimal;
      discountTotal: Decimal;
      quantity: number;
    }> = [];

    const orderVolume = this.resolveOrderVolume(selectedProducts);
    const orderDiscount = this.resolveDiscount(orderVolume);

    for (const selectedProd of selectedProducts) {
      const { productID, quantity } = selectedProd;
      const prod = this.products.find((p) => p.ID === productID);
      if (!prod) {
        throw new ClientError("invalid product ID", "requested product does not exist: " + productID, 400);
      }

      this.validateStockAvailability(selectedProd, prod);

      const productPrice = this.resolvePrice(prod, location);
      const unitPrice = new Decimal(productPrice.price);

      const taxUnitTotal = this.calculateItemTaxes(unitPrice, tax);
      const discountUnitTotal = this.calculateItemDiscounts(unitPrice, orderDiscount);

      const itemSubtotal = unitPrice.times(quantity);
      const discountTotal = discountUnitTotal.times(quantity);
      const taxTotal = taxUnitTotal.times(quantity);

      const itemTotal = itemSubtotal.plus(taxTotal).sub(discountTotal);

      productTotals.push({
        id: prod.ID,
        subtotal: itemSubtotal,
        taxTotal: taxTotal,
        quantity: quantity,
        discountTotal: discountTotal,
        total: itemTotal,
      });
    }

    const orderSubtotal = productTotals.reduce((sum, p) => sum.add(p.subtotal), new Decimal(0));
    const orderTotal = productTotals.reduce((sum, p) => sum.add(p.total), new Decimal(0));
    const orderTaxTotal = productTotals.reduce((sum, p) => sum.add(p.taxTotal), new Decimal(0));
    const orderDiscountTotal = productTotals.reduce((sum, p) => sum.add(p.discountTotal), new Decimal(0));

    return {
      total: orderTotal.toFixed(2),
      subtotal: orderSubtotal.toFixed(2),
      taxTotal: orderTaxTotal.toFixed(2),
      discountTotal: orderDiscountTotal.toFixed(2),
      discount: orderDiscount,
      tax: tax,
      productTotals: productTotals.map((p) => ({
        productID: p.id,
        quantity: p.quantity,
        discountTotal: p.discountTotal.toFixed(2),
        taxTotal: p.taxTotal.toFixed(2),
        subtotal: p.subtotal.toFixed(2),
        total: p.total.toFixed(2),
      })),
    };
  }
}
