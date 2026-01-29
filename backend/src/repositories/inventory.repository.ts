import { singleton } from "tsyringe";
import {
  Inventory,
  type InventoryPersistenceData,
} from "@entities/inventory.entity";
import { query } from "@config/db.config";

export interface IInventoryRepository {
  findByProductId(productId: string): Promise<Inventory | undefined>;
  findAll(): Promise<Inventory[]>;
  findLowStock(): Promise<Inventory[]>;
  save(inventory: Inventory): Promise<Inventory>;
  update(id: string, inventory: Inventory): Promise<Inventory | undefined>;
}

@singleton()
export class InventoryRepository implements IInventoryRepository {
  private mapRowToInventory(row: any): Inventory {
    const persistenceData: InventoryPersistenceData = {
      id: row.id,
      productId: row.product_id,
      openingStock: row.opening_stock,
      stockIn: row.stock_in,
      stockOut: row.stock_out,
      currentStock: row.current_stock,
      reorderThreshold: row.reorder_threshold,
      lastRestocked: row.last_restocked,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
    return Inventory.fromPersistence(persistenceData);
  }

  async findByProductId(productId: string): Promise<Inventory | undefined> {
    const result = await query(
      "SELECT * FROM inventory WHERE product_id = $1",
      [productId],
    );
    if (result.rows.length === 0) return undefined;
    return this.mapRowToInventory(result.rows[0]);
  }

  async findAll(): Promise<Inventory[]> {
    const result = await query(
      "SELECT * FROM inventory ORDER BY current_stock ASC",
    );
    return result.rows.map((row) => this.mapRowToInventory(row));
  }

  async findLowStock(): Promise<Inventory[]> {
    const result = await query(
      "SELECT * FROM inventory WHERE current_stock <= reorder_threshold ORDER BY current_stock ASC",
    );
    return result.rows.map((row) => this.mapRowToInventory(row));
  }

  async save(inventory: Inventory): Promise<Inventory> {
    const data = inventory.toPersistence();
    await query(
      `INSERT INTO inventory (id, product_id, opening_stock, stock_in, stock_out, current_stock, reorder_threshold, last_restocked, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        data.id,
        data.productId,
        data.openingStock,
        data.stockIn,
        data.stockOut,
        data.currentStock,
        data.reorderThreshold,
        data.lastRestocked,
        data.createdAt,
        data.updatedAt,
      ],
    );
    return inventory;
  }

  async update(
    id: string,
    inventory: Inventory,
  ): Promise<Inventory | undefined> {
    const data = inventory.toPersistence();
    const result = await query(
      `UPDATE inventory SET opening_stock = $1, stock_in = $2, stock_out = $3, current_stock = $4, reorder_threshold = $5, last_restocked = $6, updated_at = $7
       WHERE id = $8 RETURNING *`,
      [
        data.openingStock,
        data.stockIn,
        data.stockOut,
        data.currentStock,
        data.reorderThreshold,
        data.lastRestocked,
        data.updatedAt,
        id,
      ],
    );

    if (result.rows.length === 0) return undefined;
    return inventory;
  }
}
