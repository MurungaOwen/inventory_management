import crypto from "crypto";

export type NotificationType = "LOW_STOCK" | "OUT_OF_STOCK" | "REORDER_ALERT";

export interface NotificationPersistenceData {
  id: string;
  type: NotificationType;
  message: string;
  userId?: string;
  read: boolean;
  createdAt?: Date;
}

export class Notification {
  private constructor(
    private readonly _id: string,
    private _type: NotificationType,
    private _message: string,
    private _userId: string | undefined,
    private _read: boolean,
    private readonly _createdAt: Date = new Date(),
  ) {}

  static create(
    type: NotificationType,
    message: string,
    userId?: string,
  ): Notification {
    return new Notification(crypto.randomUUID(), type, message, userId, false);
  }

  static fromPersistence(data: NotificationPersistenceData): Notification {
    return new Notification(
      data.id,
      data.type,
      data.message,
      data.userId,
      data.read,
      data.createdAt || new Date(),
    );
  }

  get id(): string {
    return this._id;
  }
  get type(): NotificationType {
    return this._type;
  }
  get message(): string {
    return this._message;
  }
  get userId(): string | undefined {
    return this._userId;
  }
  get read(): boolean {
    return this._read;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  markAsRead(): void {
    this._read = true;
  }

  toPersistence(): NotificationPersistenceData {
    return {
      id: this._id,
      type: this._type,
      message: this._message,
      userId: this._userId,
      read: this._read,
      createdAt: this._createdAt,
    };
  }
}
