import { Repository } from "typeorm";
import { User } from "./user.model";
import { DataUserResponseDto } from "./dto/data-user-response.dto";
import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(userId: string): Promise<DataUserResponseDto | null> {
    const user = await this.userRepository.findOne({ where: { userId } });

    if (!user) return null;

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async createUser(user: Partial<User>): Promise<DataUserResponseDto> {
    const existingUser = await this.findByEmail(user.email!);

    if (existingUser) {
      throw new ConflictException(
        `User with email ${user.email} already exists`
      );
    }

    const hashedPassword = await this.hashPassword(user.password!);
    const newUser = await this.userRepository.save({
      ...user,
      password: hashedPassword,
    });

    const { password, ...userWithoutPassword } = newUser;

    return userWithoutPassword;
  }

  async updateUser(
    id: string,
    user: Partial<User>
  ): Promise<DataUserResponseDto | null> {
    if (user.password) {
      user.password = await this.hashPassword(user.password);
    }

    await this.userRepository.update(id, user);
    return this.findById(id);
  }

  async removeUser(id: string): Promise<boolean> {
    const result = await this.userRepository.delete(id);

    return result.affected !== 0;
  }

  async find(): Promise<DataUserResponseDto[]> {
    const users = await this.userRepository.find();

    return users.map(({ password, ...user }) => user);
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, await bcrypt.genSalt());
  }
}
