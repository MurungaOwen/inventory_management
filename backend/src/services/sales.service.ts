import { injectable, inject } from "tsyringe";
import {
  Sale,
  type PaymentMethod,
  type SaleItemCreateData,
} from "@entities/sale.entity";
import { SalesRepository } from "@repositories/sales.repository";
import type { ISalesRepository } from "@repositories/sales.repository";
import { InventoryService } from "@services/inventory.service";
import { HttpException } from "@exceptions/httpException";

@injectable()
export class SalesService {
  constructor(
    @inject(SalesRepository) private salesRepository: ISalesRepository,
    @inject(InventoryService) private inventoryService: InventoryService,
  ) {}

  public async createSale(
    cashierId: string,
    paymentMethod: PaymentMethod,
    items: SaleItemCreateData[],
  ): Promise<Sale> {
    // 1. Validate stock availability
    for (const item of items) {
      const inventory = await this.inventoryService.getInventoryByProduct(
        item.productId,
      );
      if (inventory.currentStock < item.quantity) {
        throw new HttpException(
          400,
          `Insufficient stock for product ${item.productId}`,
        );
      }
    }

    // 2. Create Sale entity
    const sale = Sale.create(cashierId, paymentMethod, items);

    // 3. Save Sale (transactional in repo)
    await this.salesRepository.save(sale);

    // 4. Update Inventory (deduct stock)
    for (const item of items) {
      await this.inventoryService.adjustStock(
        item.productId,
        item.quantity,
        "out",
      );
    }

    return sale;
  }

  public async getSalesHistory(params?: {
    startDate?: Date;
    endDate?: Date;
    cashierId?: string;
  }): Promise<Sale[]> {
    return this.salesRepository.findAll(params);
  }

  public async getSaleById(id: string): Promise<Sale> {
    const sale = await this.salesRepository.findById(id);
    if (!sale) throw new HttpException(404, "Sale not found");
    return sale;
  }
}
