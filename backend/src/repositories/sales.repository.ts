import { singleton } from "tsyringe";
import { Sale, type SalePersistenceData } from "@entities/sale.entity";
//import { SaleItem } from '@entities/sale-item.entity';
import { query, transaction } from "@config/db.config";

export interface ISalesRepository {
  findAll(params?: {
    startDate?: Date;
    endDate?: Date;
    cashierId?: string;
  }): Promise<Sale[]>;
  findById(id: string): Promise<Sale | undefined>;
  save(sale: Sale): Promise<Sale>;
  getSalesStats(startDate: Date, endDate: Date): Promise<any>;
  getDailyBreakdown(startDate: Date, endDate: Date): Promise<any[]>;
  getPaymentMethodBreakdown(startDate: Date, endDate: Date): Promise<any[]>;
  getTopProducts(
    startDate: Date,
    endDate: Date,
    limit?: number,
  ): Promise<any[]>;
  getCashierPerformance(startDate: Date, endDate: Date): Promise<any[]>;
}

@singleton()
export class SalesRepository implements ISalesRepository {
  private async mapRowToSale(
    row: any,
    fetchItems: boolean = false,
  ): Promise<Sale> {
    let items: any[] = [];
    if (fetchItems) {
      const itemsResult = await query(
        "SELECT * FROM sale_items WHERE sale_id = $1",
        [row.id],
      );
      items = itemsResult.rows.map((itemRow) => ({
        id: itemRow.id,
        saleId: itemRow.sale_id,
        productId: itemRow.product_id,
        quantity: itemRow.quantity,
        unitPrice: itemRow.unit_price,
        subtotal: itemRow.subtotal,
        createdAt: itemRow.created_at,
      }));
    }

    const persistenceData: SalePersistenceData = {
      id: row.id,
      saleNumber: row.sale_number,
      totalAmount: row.total_amount,
      paymentMethod: row.payment_method,
      cashierId: row.cashier_id,
      items: items,
      createdAt: row.created_at,
    };
    return Sale.fromPersistence(persistenceData);
  }

  async findAll(params?: {
    startDate?: Date;
    endDate?: Date;
    cashierId?: string;
  }): Promise<Sale[]> {
    let sql = "SELECT * FROM sales WHERE 1=1";
    const values: any[] = [];
    let paramIndex = 1;

    if (params?.startDate) {
      sql += ` AND created_at >= $${paramIndex++}`;
      values.push(params.startDate);
    }

    if (params?.endDate) {
      sql += ` AND created_at <= $${paramIndex++}`;
      values.push(params.endDate);
    }

    if (params?.cashierId) {
      sql += ` AND cashier_id = $${paramIndex++}`;
      values.push(params.cashierId);
    }

    sql += " ORDER BY created_at DESC";

    const result = await query(sql, values);

    // For list view, we might not need items, but let's fetch them for now or optimize later
    // To avoid N+1, we could fetch all items in one go, but for simplicity:
    const sales = await Promise.all(
      result.rows.map((row) => this.mapRowToSale(row, true)),
    );
    return sales;
  }

  async findById(id: string): Promise<Sale | undefined> {
    const result = await query("SELECT * FROM sales WHERE id = $1", [id]);
    if (result.rows.length === 0) return undefined;
    return this.mapRowToSale(result.rows[0], true);
  }

  async save(sale: Sale): Promise<Sale> {
    return transaction(async (client) => {
      const data = sale.toPersistence();

      // Save Sale
      await client.query(
        `INSERT INTO sales (id, sale_number, total_amount, payment_method, cashier_id, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          data.id,
          data.saleNumber,
          data.totalAmount,
          data.paymentMethod,
          data.cashierId,
          data.createdAt,
        ],
      );

      // Save Sale Items
      if (data.items && data.items.length > 0) {
        for (const item of data.items) {
          await client.query(
            `INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, subtotal, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              item.id,
              item.saleId,
              item.productId,
              item.quantity,
              item.unitPrice,
              item.subtotal,
              item.createdAt,
            ],
          );
        }
      }

      return sale;
    });
  }

  async getSalesStats(startDate: Date, endDate: Date): Promise<any> {
    const result = await query(
      `SELECT 
         COUNT(*) as total_sales,
         COALESCE(SUM(total_amount), 0) as total_revenue,
         COALESCE(AVG(total_amount), 0) as average_sale
       FROM sales 
       WHERE created_at BETWEEN $1 AND $2`,
      [startDate, endDate],
    );
    return result.rows[0];
  }

  async getDailyBreakdown(startDate: Date, endDate: Date): Promise<any[]> {
    const result = await query(
      `SELECT 
         DATE(created_at) as date,
         COUNT(*) as transaction_count,
         COALESCE(SUM(total_amount), 0) as revenue,
         COALESCE(AVG(total_amount), 0) as average_sale
       FROM sales 
       WHERE created_at BETWEEN $1 AND $2
       GROUP BY DATE(created_at)
       ORDER BY DATE(created_at) ASC`,
      [startDate, endDate],
    );
    return result.rows.map((row) => ({
      date: new Date(row.date).toISOString().split("T")[0],
      transactionCount: parseInt(row.transaction_count),
      revenue: parseFloat(row.revenue),
      averageSale: parseFloat(row.average_sale),
    }));
  }

  async getPaymentMethodBreakdown(
    startDate: Date,
    endDate: Date,
  ): Promise<any[]> {
    const result = await query(
      `SELECT 
         payment_method,
         COUNT(*) as count,
         COALESCE(SUM(total_amount), 0) as total
       FROM sales 
       WHERE created_at BETWEEN $1 AND $2
       GROUP BY payment_method
       ORDER BY total DESC`,
      [startDate, endDate],
    );
    return result.rows.map((row) => ({
      name: row.payment_method,
      value: parseInt(row.count),
      total: parseFloat(row.total),
    }));
  }

  async getTopProducts(
    startDate: Date,
    endDate: Date,
    limit: number = 10,
  ): Promise<any[]> {
    const result = await query(
      `SELECT 
         p.id,
         p.name,
         SUM(si.quantity) as total_quantity,
         COALESCE(SUM(si.subtotal), 0) as total_revenue,
         COUNT(DISTINCT s.id) as transaction_count
       FROM sale_items si
       JOIN sales s ON si.sale_id = s.id
       JOIN products p ON si.product_id = p.id
       WHERE s.created_at BETWEEN $1 AND $2
       GROUP BY p.id, p.name
       ORDER BY total_revenue DESC
       LIMIT $3`,
      [startDate, endDate, limit],
    );
    return result.rows.map((row) => ({
      productId: row.id,
      productName: row.name,
      quantity: parseInt(row.total_quantity),
      revenue: parseFloat(row.total_revenue),
      transactionCount: parseInt(row.transaction_count),
    }));
  }

  async getCashierPerformance(startDate: Date, endDate: Date): Promise<any[]> {
    const result = await query(
      `SELECT 
         u.id,
         u.full_name,
         COUNT(DISTINCT s.id) as transaction_count,
         COALESCE(SUM(s.total_amount), 0) as total_revenue,
         COALESCE(AVG(s.total_amount), 0) as average_sale
       FROM sales s
       JOIN users u ON s.cashier_id = u.id
       WHERE s.created_at BETWEEN $1 AND $2
       GROUP BY u.id, u.full_name
       ORDER BY total_revenue DESC`,
      [startDate, endDate],
    );
    return result.rows.map((row) => ({
      userId: row.id,
      userName: row.full_name,
      transactionCount: parseInt(row.transaction_count),
      totalRevenue: parseFloat(row.total_revenue),
      averageSale: parseFloat(row.average_sale),
    }));
  }
}
