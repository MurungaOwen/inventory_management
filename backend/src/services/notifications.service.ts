import { injectable, inject } from "tsyringe";
import {
  Notification,
  type NotificationType,
} from "@entities/notification.entity";
import { NotificationsRepository } from "@repositories/notifications.repository";
import type { INotificationsRepository } from "@repositories/notifications.repository";
import { HttpException } from "@exceptions/httpException";

@injectable()
export class NotificationsService {
  constructor(
    @inject(NotificationsRepository)
    private notificationsRepository: INotificationsRepository,
  ) {}

  public async createNotification(
    type: NotificationType,
    message: string,
    userId?: string,
  ): Promise<Notification> {
    const notification = Notification.create(type, message, userId);
    return this.notificationsRepository.save(notification);
  }

  public async getUserNotifications(userId: string): Promise<Notification[]> {
    return this.notificationsRepository.findByUserId(userId);
  }

  public async getUnreadCount(userId: string): Promise<number> {
    return this.notificationsRepository.findUnreadCount(userId);
  }

  public async markAsRead(id: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findById(id);
    if (!notification) throw new HttpException(404, "Notification not found");

    notification.markAsRead();
    await this.notificationsRepository.update(id, notification);
    return notification;
  }
}
