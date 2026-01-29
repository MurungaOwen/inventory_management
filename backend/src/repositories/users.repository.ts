import { singleton } from "tsyringe";
import {
  User,
  type UserPersistenceData,
  type UserRole,
} from "@entities/user.entity";
import { query } from "@config/db.config";

export interface IUsersRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | undefined>;
  findByEmail(email: string): Promise<User | undefined>;
  findByPhone(phone: string): Promise<User | undefined>;
  save(user: User): Promise<User>;
  update(id: string, user: User): Promise<User | undefined>;
  delete(id: string): Promise<boolean>;
}

@singleton()
export class UsersRepository implements IUsersRepository {
  private mapRowToUser(row: any): User {
    const persistenceData: UserPersistenceData = {
      id: row.id,
      email: row.email,
      phone: row.phone,
      password: row.password,
      fullName: row.full_name,
      role: row.role as UserRole,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
    return User.fromPersistence(persistenceData);
  }

  async findAll(): Promise<User[]> {
    const result = await query("SELECT * FROM users");
    return result.rows.map((row) => this.mapRowToUser(row));
  }

  async findById(id: string): Promise<User | undefined> {
    const result = await query("SELECT * FROM users WHERE id = $1", [id]);
    if (result.rows.length === 0) return undefined;
    return this.mapRowToUser(result.rows[0]);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const result = await query("SELECT * FROM users WHERE email = $1", [
      email.toLowerCase(),
    ]);
    if (result.rows.length === 0) return undefined;
    return this.mapRowToUser(result.rows[0]);
  }

  async findByPhone(phone: string): Promise<User | undefined> {
    const result = await query("SELECT * FROM users WHERE phone = $1", [phone]);
    if (result.rows.length === 0) return undefined;
    return this.mapRowToUser(result.rows[0]);
  }

  async save(user: User): Promise<User> {
    const data = user.toPersistence();
    await query(
      `INSERT INTO users (id, email, phone, password, full_name, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        data.id,
        data.email,
        data.phone,
        data.password,
        data.fullName,
        data.role,
        data.createdAt,
        data.updatedAt,
      ],
    );
    return user;
  }

  async update(id: string, user: User): Promise<User | undefined> {
    const data = user.toPersistence();
    const result = await query(
      `UPDATE users SET email = $1, phone = $2, password = $3, full_name = $4, role = $5, updated_at = $6
       WHERE id = $7 RETURNING *`,
      [
        data.email,
        data.phone,
        data.password,
        data.fullName,
        data.role,
        data.updatedAt,
        id,
      ],
    );

    if (result.rows.length === 0) return undefined;
    return user;
  }

  async delete(id: string): Promise<boolean> {
    const result = await query("DELETE FROM users WHERE id = $1", [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
