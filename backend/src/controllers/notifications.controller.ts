import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";
import { NotificationsService } from "@services/notifications.service";
import { RequestWithUser } from "@interfaces/auth.interface";
import { asyncHandler } from "@utils/asyncHandler";

@injectable()
export class NotificationsController {
  constructor(
    @inject(NotificationsService)
    private notificationsService: NotificationsService,
  ) {}

  public getUserNotifications = asyncHandler(
    async (req: Request, res: Response) => {
      const userReq = req as RequestWithUser;
      const userId = userReq.user.id;
      const notifications =
        await this.notificationsService.getUserNotifications(userId);
      res
        .status(200)
        .json({
          data: notifications.map((n) => n.toPersistence()),
          message: "findAll",
        });
    },
  );

  public getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
    const userReq = req as RequestWithUser;
    const userId = userReq.user.id;
    const count = await this.notificationsService.getUnreadCount(userId);
    res.status(200).json({ data: { count }, message: "unreadCount" });
  });

  public markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string; // Ensure id is a string
    const notification = await this.notificationsService.markAsRead(id);
    res
      .status(200)
      .json({ data: notification.toPersistence(), message: "markedAsRead" });
  });
}
