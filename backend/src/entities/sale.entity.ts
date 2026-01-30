import crypto from "crypto";
import { SaleItem, type SaleItemPersistenceData } from "./sale-item.entity";

export type PaymentMethod = "Cash" | "Mobile Money";

export interface SalePersistenceData {
  id: string;
  saleNumber: string;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  cashierId: string;
  items?: SaleItemPersistenceData[];
  createdAt?: Date;
}

export interface SaleItemCreateData {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export class Sale {
  private constructor(
    private readonly _id: string,
    private _saleNumber: string,
    private _totalAmount: number,
    private _paymentMethod: PaymentMethod,
    private _cashierId: string,
    private _items: SaleItem[] = [],
    private readonly _createdAt: Date = new Date(),
  ) {}

  static create(
    cashierId: string,
    paymentMethod: PaymentMethod,
    itemsData: SaleItemCreateData[],
  ): Sale {
    if (itemsData.length === 0)
      throw new Error("Sale must have at least one item");

    const id = crypto.randomUUID();
    const items = itemsData.map((d) =>
      SaleItem.create(id, d.productId, d.quantity, d.unitPrice),
    );
    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
    const saleNumber = `SALE-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    return new Sale(
      id,
      saleNumber,
      totalAmount,
      paymentMethod,
      cashierId,
      items,
    );
  }

  static fromPersistence(data: SalePersistenceData): Sale {
    const items = data.items
      ? data.items.map((i) => SaleItem.fromPersistence(i))
      : [];
    return new Sale(
      data.id,
      data.saleNumber,
      Number(data.totalAmount),
      data.paymentMethod,
      data.cashierId,
      items,
      data.createdAt || new Date(),
    );
  }

  get id(): string {
    return this._id;
  }
  get saleNumber(): string {
    return this._saleNumber;
  }
  get totalAmount(): number {
    return this._totalAmount;
  }
  get paymentMethod(): PaymentMethod {
    return this._paymentMethod;
  }
  get cashierId(): string {
    return this._cashierId;
  }
  get items(): SaleItem[] {
    return [...this._items];
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  toPersistence(): SalePersistenceData {
    return {
      id: this._id,
      saleNumber: this._saleNumber,
      totalAmount: this._totalAmount,
      paymentMethod: this._paymentMethod,
      cashierId: this._cashierId,
      items: this._items.map((i) => i.toPersistence()),
      createdAt: this._createdAt,
    };
  }
}
