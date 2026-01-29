import { Router } from 'express';
import { injectable, inject } from 'tsyringe';
import { ReportsController } from '@controllers/reports.controller';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@middlewares/auth.middleware';
import { RoleMiddleware } from '@middlewares/role.middleware';

@injectable()
export class ReportsRoute implements Routes {
  public router: Router = Router();
  public path = '/reports';

  constructor(@inject(ReportsController) private reportsController: ReportsController) {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Only Owner and Manager can view reports
    this.router.get(
      `${this.path}/daily`,
      AuthMiddleware,
      RoleMiddleware(['Cashier','Owner', 'Manager']),
      this.reportsController.getDailyReport as any,
    );
    this.router.get(
      `${this.path}/weekly`,
      AuthMiddleware,
      RoleMiddleware(['Cashier','Owner', 'Manager']),
      this.reportsController.getWeeklyReport as any,
    );
    this.router.get(
      `${this.path}/monthly`,
      AuthMiddleware,
      RoleMiddleware(['Cashier','Owner', 'Manager']),
      this.reportsController.getMonthlyReport as any,
    );
    this.router.get(
      `${this.path}/custom-range`,
      AuthMiddleware,
      RoleMiddleware(['Cashier','Owner', 'Manager']),
      this.reportsController.getCustomRangeReport as any,
    );
  }
}
