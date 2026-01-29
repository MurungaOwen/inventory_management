import { Router } from "express";
import { injectable, inject } from "tsyringe";
import { NotificationsController } from "@controllers/notifications.controller";
import { Routes } from "@interfaces/routes.interface";
import { AuthMiddleware } from "@middlewares/auth.middleware";

@injectable()
export class NotificationsRoute implements Routes {
  public router: Router = Router();
  public path = "/notifications";

  constructor(
    @inject(NotificationsController)
    private notificationsController: NotificationsController,
  ) {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}`,
      AuthMiddleware,
      this.notificationsController.getUserNotifications,
    );
    this.router.get(
      `${this.path}/unread-count`,
      AuthMiddleware,
      this.notificationsController.getUnreadCount,
    );
    this.router.put(
      `${this.path}/:id/read`,
      AuthMiddleware,
      this.notificationsController.markAsRead,
    );
  }
}
