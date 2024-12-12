import { Repository } from "typeorm";
import { User } from "./user.model";

export class UserRepository extends Repository<User> {
  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.findOne({ where: { id } });
  }

  async createUser(user: Partial<User>): Promise<User> {
    return this.save(user);
  }

  async updateUser(id: string, user: Partial<User>): Promise<User | null> {
    await this.update(id, user);
    return this.findById(id);
  }

  async removeUser(id: string): Promise<void> {
    await this.delete(id);
  }
}
