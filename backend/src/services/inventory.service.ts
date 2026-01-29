import { injectable, inject } from "tsyringe";
import { Inventory } from "@entities/inventory.entity";
import { InventoryRepository } from "@repositories/inventory.repository";
import type { IInventoryRepository } from "@repositories/inventory.repository";
import { NotificationsService } from "@services/notifications.service";
import { HttpException } from "@exceptions/httpException";

@injectable()
export class InventoryService {
  constructor(
    @inject(InventoryRepository)
    private inventoryRepository: IInventoryRepository,
    @inject(NotificationsService)
    private notificationsService: NotificationsService,
  ) {}

  public async getInventoryByProduct(productId: string): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findByProductId(productId);
    if (!inventory) throw new HttpException(404, "Inventory not found");
    return inventory;
  }

  public async getAllInventory(): Promise<Inventory[]> {
    return this.inventoryRepository.findAll();
  }

  public async getLowStockInventory(): Promise<Inventory[]> {
    return this.inventoryRepository.findLowStock();
  }

  public async adjustStock(
    productId: string,
    quantity: number,
    type: "in" | "out",
  ): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findByProductId(productId);
    if (!inventory) throw new HttpException(404, "Inventory not found");

    if (type === "in") {
      inventory.addStock(quantity);
    } else {
      try {
        inventory.removeStock(quantity);
      } catch (error: any) {
        throw new HttpException(400, error.message);
      }
    }

    await this.inventoryRepository.update(inventory.id, inventory);

    // Check for low stock
    if (inventory.isLowStock()) {
      await this.notificationsService.createNotification(
        "LOW_STOCK",
        `Product ${productId} is low on stock. Current: ${inventory.currentStock}`,
      );
    }

    return inventory;
  }

  public async updateReorderThreshold(
    productId: string,
    threshold: number,
  ): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findByProductId(productId);
    if (!inventory) throw new HttpException(404, "Inventory not found");

    inventory.setReorderThreshold(threshold);
    await this.inventoryRepository.update(inventory.id, inventory);
    return inventory;
  }
}
