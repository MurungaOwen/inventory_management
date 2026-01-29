import { singleton } from "tsyringe";
import {
  Notification,
  type NotificationPersistenceData,
  type NotificationType,
} from "@entities/notification.entity";
import { query } from "@config/db.config";

export interface INotificationsRepository {
  findByUserId(userId: string): Promise<Notification[]>;
  findById(id: string): Promise<Notification | undefined>;
  findUnreadCount(userId: string): Promise<number>;
  save(notification: Notification): Promise<Notification>;
  update(
    id: string,
    notification: Notification,
  ): Promise<Notification | undefined>;
}

@singleton()
export class NotificationsRepository implements INotificationsRepository {
  private mapRowToNotification(row: any): Notification {
    const persistenceData: NotificationPersistenceData = {
      id: row.id,
      type: row.type as NotificationType,
      message: row.message,
      userId: row.user_id,
      read: row.read,
      createdAt: row.created_at,
    };
    return Notification.fromPersistence(persistenceData);
  }

  async findByUserId(userId: string): Promise<Notification[]> {
    const result = await query(
      "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC",
      [userId],
    );
    return result.rows.map((row) => this.mapRowToNotification(row));
  }

  async findById(id: string): Promise<Notification | undefined> {
    const result = await query("SELECT * FROM notifications WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0) return undefined;
    return this.mapRowToNotification(result.rows[0]);
  }

  async findUnreadCount(userId: string): Promise<number> {
    const result = await query(
      "SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read = false",
      [userId],
    );
    return parseInt(result.rows[0].count, 10);
  }

  async save(notification: Notification): Promise<Notification> {
    const data = notification.toPersistence();
    await query(
      `INSERT INTO notifications (id, type, message, user_id, read, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        data.id,
        data.type,
        data.message,
        data.userId,
        data.read,
        data.createdAt,
      ],
    );
    return notification;
  }

  async update(
    id: string,
    notification: Notification,
  ): Promise<Notification | undefined> {
    const data = notification.toPersistence();
    const result = await query(
      `UPDATE notifications SET read = $1 WHERE id = $2 RETURNING *`,
      [data.read, id],
    );

    if (result.rows.length === 0) return undefined;
    return notification;
  }
}
