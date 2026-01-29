import { Router } from "express";
import { injectable, inject } from "tsyringe";
import { InventoryController } from "@controllers/inventory.controller";
import { Routes } from "@interfaces/routes.interface";
import { AuthMiddleware } from "@middlewares/auth.middleware";
import { RoleMiddleware } from "@middlewares/role.middleware";
import { ValidationMiddleware } from "@middlewares/validation.middleware";
import { adjustStockSchema, updateThresholdSchema } from "@dtos/inventory.dto";

@injectable()
export class InventoryRoute implements Routes {
  public router: Router = Router();
  public path = "/inventory";

  constructor(
    @inject(InventoryController)
    private inventoryController: InventoryController,
  ) {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}`,
      AuthMiddleware,
      this.inventoryController.getAllInventory,
    );
    this.router.get(
      `${this.path}/low-stock`,
      AuthMiddleware,
      this.inventoryController.getLowStock,
    );
    this.router.get(
      `${this.path}/:productId`,
      AuthMiddleware,
      this.inventoryController.getInventoryByProduct,
    );

    // Only Owner and Manager can adjust stock manually
    this.router.post(
      `${this.path}/adjust`,
      AuthMiddleware,
      RoleMiddleware(["Owner", "Manager"]),
      ValidationMiddleware(adjustStockSchema),
      this.inventoryController.adjustStock,
    );

    this.router.put(
      `${this.path}/threshold`,
      AuthMiddleware,
      RoleMiddleware(["Owner", "Manager"]),
      ValidationMiddleware(updateThresholdSchema),
      this.inventoryController.updateThreshold,
    );
  }
}
