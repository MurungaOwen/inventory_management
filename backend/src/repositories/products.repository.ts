import { singleton } from "tsyringe";
import { Product, type ProductPersistenceData } from "@entities/product.entity";
import { query } from "@config/db.config";

export interface IProductsRepository {
  findAll(params?: { category?: string; search?: string }): Promise<Product[]>;
  findById(id: string): Promise<Product | undefined>;
  findBySku(sku: string): Promise<Product | undefined>;
  save(product: Product): Promise<Product>;
  update(id: string, product: Product): Promise<Product | undefined>;
  delete(id: string): Promise<boolean>;
}

@singleton()
export class ProductsRepository implements IProductsRepository {
  private mapRowToProduct(row: any): Product {
    const persistenceData: ProductPersistenceData = {
      id: row.id,
      sku: row.sku,
      name: row.name,
      category: row.category,
      supplier: row.supplier,
      unit: row.unit,
      costPrice: row.cost_price,
      sellingPrice: row.selling_price,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
    return Product.fromPersistence(persistenceData);
  }

  async findAll(params?: {
    category?: string;
    search?: string;
  }): Promise<Product[]> {
    let sql = "SELECT * FROM products WHERE 1=1";
    const values: any[] = [];
    let paramIndex = 1;

    if (params?.category) {
      sql += ` AND category = $${paramIndex++}`;
      values.push(params.category);
    }

    if (params?.search) {
      sql += ` AND (name ILIKE $${paramIndex} OR sku ILIKE $${paramIndex})`;
      values.push(`%${params.search}%`);
      paramIndex++;
    }

    sql += " ORDER BY created_at DESC";

    const result = await query(sql, values);
    return result.rows.map((row) => this.mapRowToProduct(row));
  }

  async findById(id: string): Promise<Product | undefined> {
    const result = await query("SELECT * FROM products WHERE id = $1", [id]);
    if (result.rows.length === 0) return undefined;
    return this.mapRowToProduct(result.rows[0]);
  }

  async findBySku(sku: string): Promise<Product | undefined> {
    const result = await query("SELECT * FROM products WHERE sku = $1", [sku]);
    if (result.rows.length === 0) return undefined;
    return this.mapRowToProduct(result.rows[0]);
  }

  async save(product: Product): Promise<Product> {
    const data = product.toPersistence();
    await query(
      `INSERT INTO products (id, sku, name, category, supplier, unit, cost_price, selling_price, description, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        data.id,
        data.sku,
        data.name,
        data.category,
        data.supplier,
        data.unit,
        data.costPrice,
        data.sellingPrice,
        data.description,
        data.createdAt,
        data.updatedAt,
      ],
    );
    return product;
  }

  async update(id: string, product: Product): Promise<Product | undefined> {
    const data = product.toPersistence();
    const result = await query(
      `UPDATE products SET sku = $1, name = $2, category = $3, supplier = $4, unit = $5, cost_price = $6, selling_price = $7, description = $8, updated_at = $9
       WHERE id = $10 RETURNING *`,
      [
        data.sku,
        data.name,
        data.category,
        data.supplier,
        data.unit,
        data.costPrice,
        data.sellingPrice,
        data.description,
        data.updatedAt,
        id,
      ],
    );

    if (result.rows.length === 0) return undefined;
    return product;
  }

  async delete(id: string): Promise<boolean> {
    const result = await query("DELETE FROM products WHERE id = $1", [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
