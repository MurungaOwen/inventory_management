import { Router } from 'express';
import { injectable, inject } from 'tsyringe';
import { SalesController } from '@controllers/sales.controller';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@middlewares/auth.middleware';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { createSaleSchema } from '@dtos/sales.dto';

@injectable()
export class SalesRoute implements Routes {
  public router: Router = Router();
  public path = '/sales';

  constructor(@inject(SalesController) private salesController: SalesController) {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, AuthMiddleware, this.salesController.getSalesHistory);
    this.router.get(`${this.path}/:id`, AuthMiddleware, this.salesController.getSaleById);

    this.router.post(
      `${this.path}`,
      AuthMiddleware,
      ValidationMiddleware(createSaleSchema),
      this.salesController.createSale,
    );
  }
}
