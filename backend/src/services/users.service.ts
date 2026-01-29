import { injectable, inject } from "tsyringe";
import { HttpException } from "@exceptions/httpException";
import { User, type UserCreateData } from "@entities/user.entity";
import { UsersRepository } from "@repositories/users.repository";
import type { IUsersRepository } from "@repositories/users.repository";

@injectable()
export class UsersService {
  constructor(
    @inject(UsersRepository) private usersRepository: IUsersRepository,
  ) {}

  async getAllUsers(): Promise<User[]> {
    return this.usersRepository.findAll();
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new HttpException(404, "User not found");
    return user;
  }

  async createUser(userData: UserCreateData): Promise<User> {
    // Check for duplicate email first in the repository
    const exists = await this.usersRepository.findByEmail(userData.email);
    if (exists) throw new HttpException(409, "Email already exists");

    // Created using the factory method of the Entity class (all validations are automatically handled)
    const user = await User.create(userData);

    await this.usersRepository.save(user);
    return user;
  }

  async updateUser(
    id: string,
    updateData: { email?: string; password?: string },
  ): Promise<User> {
    const existingUser = await this.usersRepository.findById(id);
    if (!existingUser) throw new HttpException(404, "User not found");

    // Use the domain method of the Entity to update
    await existingUser.updateProfile(updateData);

    const updated = await this.usersRepository.update(id, existingUser);
    if (!updated) throw new HttpException(404, "User not found");
    return updated;
  }

  async deleteUser(id: string): Promise<void> {
    const deleted = await this.usersRepository.delete(id);
    if (!deleted) throw new HttpException(404, "User not found");
  }
}
