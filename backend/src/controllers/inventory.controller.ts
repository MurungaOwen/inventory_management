import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";
import { InventoryService } from "@services/inventory.service";
import { asyncHandler } from "@utils/asyncHandler";

@injectable()
export class InventoryController {
  constructor(
    @inject(InventoryService) private inventoryService: InventoryService,
  ) {}

  public getAllInventory = asyncHandler(async (req: Request, res: Response) => {
    const inventory = await this.inventoryService.getAllInventory();
    res
      .status(200)
      .json({
        data: inventory.map((i) => i.toPersistence()),
        message: "findAll",
      });
  });

  public getInventoryByProduct = asyncHandler(
    async (req: Request, res: Response) => {
      const productId = req.params.productId as string; // Ensure productId is a string
      const inventory =
        await this.inventoryService.getInventoryByProduct(productId);
      res
        .status(200)
        .json({ data: inventory.toPersistence(), message: "findOne" });
    },
  );

  public getLowStock = asyncHandler(async (req: Request, res: Response) => {
    const inventory = await this.inventoryService.getLowStockInventory();
    res
      .status(200)
      .json({
        data: inventory.map((i) => i.toPersistence()),
        message: "findLowStock",
      });
  });

  public adjustStock = asyncHandler(async (req: Request, res: Response) => {
    const { productId, quantity, type } = req.body;
    const inventory = await this.inventoryService.adjustStock(
      productId,
      quantity,
      type,
    );
    res
      .status(200)
      .json({ data: inventory.toPersistence(), message: "adjusted" });
  });

  public updateThreshold = asyncHandler(async (req: Request, res: Response) => {
    const { productId, threshold } = req.body;
    const inventory = await this.inventoryService.updateReorderThreshold(
      productId,
      threshold,
    );
    res
      .status(200)
      .json({ data: inventory.toPersistence(), message: "thresholdUpdated" });
  });
}
