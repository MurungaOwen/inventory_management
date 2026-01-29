import crypto from "crypto";

export interface InventoryPersistenceData {
  id: string;
  productId: string;
  openingStock: number;
  stockIn: number;
  stockOut: number;
  currentStock: number;
  reorderThreshold: number;
  lastRestocked?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Inventory {
  private constructor(
    private readonly _id: string,
    private readonly _productId: string,
    private _openingStock: number,
    private _stockIn: number,
    private _stockOut: number,
    private _currentStock: number,
    private _reorderThreshold: number,
    private _lastRestocked: Date | undefined,
    private readonly _createdAt: Date = new Date(),
    private _updatedAt: Date = new Date(),
  ) {}

  static create(
    productId: string,
    openingStock: number = 0,
    reorderThreshold: number = 10,
  ): Inventory {
    if (openingStock < 0) throw new Error("Opening stock cannot be negative");
    if (reorderThreshold < 0)
      throw new Error("Reorder threshold cannot be negative");

    return new Inventory(
      crypto.randomUUID(),
      productId,
      openingStock,
      0,
      0,
      openingStock, // Initial current stock is opening stock
      reorderThreshold,
      openingStock > 0 ? new Date() : undefined,
    );
  }

  static fromPersistence(data: InventoryPersistenceData): Inventory {
    return new Inventory(
      data.id,
      data.productId,
      data.openingStock,
      data.stockIn,
      data.stockOut,
      data.currentStock,
      data.reorderThreshold,
      data.lastRestocked,
      data.createdAt || new Date(),
      data.updatedAt || new Date(),
    );
  }

  get id(): string {
    return this._id;
  }
  get productId(): string {
    return this._productId;
  }
  get currentStock(): number {
    return this._currentStock;
  }
  get reorderThreshold(): number {
    return this._reorderThreshold;
  }
  get lastRestocked(): Date | undefined {
    return this._lastRestocked;
  }

  addStock(quantity: number): void {
    if (quantity <= 0) throw new Error("Quantity must be positive");

    this._stockIn += quantity;
    this._currentStock += quantity;
    this._lastRestocked = new Date();
    this._updatedAt = new Date();
  }

  removeStock(quantity: number): void {
    if (quantity <= 0) throw new Error("Quantity must be positive");
    if (this._currentStock < quantity) throw new Error("Insufficient stock");

    this._stockOut += quantity;
    this._currentStock -= quantity;
    this._updatedAt = new Date();
  }

  adjustOpeningStock(newOpeningStock: number): void {
    if (newOpeningStock < 0)
      throw new Error("Opening stock cannot be negative");

    // Recalculate current stock based on new opening stock
    // current = newOpening + in - out
    this._openingStock = newOpeningStock;
    this._currentStock = this._openingStock + this._stockIn - this._stockOut;
    this._updatedAt = new Date();
  }

  setReorderThreshold(threshold: number): void {
    if (threshold < 0) throw new Error("Threshold cannot be negative");
    this._reorderThreshold = threshold;
    this._updatedAt = new Date();
  }

  isLowStock(): boolean {
    return this._currentStock <= this._reorderThreshold;
  }

  toPersistence(): InventoryPersistenceData {
    return {
      id: this._id,
      productId: this._productId,
      openingStock: this._openingStock,
      stockIn: this._stockIn,
      stockOut: this._stockOut,
      currentStock: this._currentStock,
      reorderThreshold: this._reorderThreshold,
      lastRestocked: this._lastRestocked,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
