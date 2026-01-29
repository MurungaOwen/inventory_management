import crypto from "crypto";

export interface SaleItemPersistenceData {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  createdAt?: Date;
}

export class SaleItem {
  private constructor(
    private readonly _id: string,
    private _saleId: string,
    private _productId: string,
    private _quantity: number,
    private _unitPrice: number,
    private _subtotal: number,
    private readonly _createdAt: Date = new Date(),
  ) {}

  static create(
    saleId: string,
    productId: string,
    quantity: number,
    unitPrice: number,
  ): SaleItem {
    if (quantity <= 0) throw new Error("Quantity must be positive");
    if (unitPrice < 0) throw new Error("Unit price cannot be negative");

    const subtotal = quantity * unitPrice;

    return new SaleItem(
      crypto.randomUUID(),
      saleId,
      productId,
      quantity,
      unitPrice,
      subtotal,
    );
  }

  static fromPersistence(data: SaleItemPersistenceData): SaleItem {
    return new SaleItem(
      data.id,
      data.saleId,
      data.productId,
      data.quantity,
      Number(data.unitPrice),
      Number(data.subtotal),
      data.createdAt || new Date(),
    );
  }

  get id(): string {
    return this._id;
  }
  get saleId(): string {
    return this._saleId;
  }
  get productId(): string {
    return this._productId;
  }
  get quantity(): number {
    return this._quantity;
  }
  get unitPrice(): number {
    return this._unitPrice;
  }
  get subtotal(): number {
    return this._subtotal;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  toPersistence(): SaleItemPersistenceData {
    return {
      id: this._id,
      saleId: this._saleId,
      productId: this._productId,
      quantity: this._quantity,
      unitPrice: this._unitPrice,
      subtotal: this._subtotal,
      createdAt: this._createdAt,
    };
  }
}
