import crypto from "crypto";

export interface ProductPersistenceData {
  id: string;
  sku: string;
  name: string;
  category: string;
  supplier?: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductCreateData {
  sku: string;
  name: string;
  category: string;
  supplier?: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  description?: string;
}

export class Product {
  private constructor(
    private readonly _id: string,
    private _sku: string,
    private _name: string,
    private _category: string,
    private _supplier: string | undefined,
    private _unit: string,
    private _costPrice: number,
    private _sellingPrice: number,
    private _description: string | undefined,
    private readonly _createdAt: Date = new Date(),
    private _updatedAt: Date = new Date(),
  ) {}

  static create(data: ProductCreateData): Product {
    if (data.costPrice < 0) throw new Error("Cost price cannot be negative");
    if (data.sellingPrice < 0)
      throw new Error("Selling price cannot be negative");
    if (!data.name) throw new Error("Product name is required");
    if (!data.sku) throw new Error("SKU is required");

    return new Product(
      crypto.randomUUID(),
      data.sku,
      data.name,
      data.category,
      data.supplier,
      data.unit,
      data.costPrice,
      data.sellingPrice,
      data.description,
    );
  }

  static fromPersistence(data: ProductPersistenceData): Product {
    return new Product(
      data.id,
      data.sku,
      data.name,
      data.category,
      data.supplier,
      data.unit,
      Number(data.costPrice), // Ensure number type from DB string/decimal
      Number(data.sellingPrice),
      data.description,
      data.createdAt || new Date(),
      data.updatedAt || new Date(),
    );
  }

  get id(): string {
    return this._id;
  }
  get sku(): string {
    return this._sku;
  }
  get name(): string {
    return this._name;
  }
  get category(): string {
    return this._category;
  }
  get supplier(): string | undefined {
    return this._supplier;
  }
  get unit(): string {
    return this._unit;
  }
  get costPrice(): number {
    return this._costPrice;
  }
  get sellingPrice(): number {
    return this._sellingPrice;
  }
  get description(): string | undefined {
    return this._description;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }
  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  update(data: Partial<ProductCreateData>): void {
    if (data.name) this._name = data.name;
    if (data.category) this._category = data.category;
    if (data.supplier !== undefined) this._supplier = data.supplier;
    if (data.unit) this._unit = data.unit;
    if (data.description !== undefined) this._description = data.description;

    if (data.costPrice !== undefined) {
      if (data.costPrice < 0) throw new Error("Cost price cannot be negative");
      this._costPrice = data.costPrice;
    }

    if (data.sellingPrice !== undefined) {
      if (data.sellingPrice < 0)
        throw new Error("Selling price cannot be negative");
      this._sellingPrice = data.sellingPrice;
    }

    this._updatedAt = new Date();
  }

  toPersistence(): ProductPersistenceData {
    return {
      id: this._id,
      sku: this._sku,
      name: this._name,
      category: this._category,
      supplier: this._supplier,
      unit: this._unit,
      costPrice: this._costPrice,
      sellingPrice: this._sellingPrice,
      description: this._description,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
