import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserRepository } from "./user.repository";
import { DataUserResponseDto } from "./dto/data-user-response.dto";
import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async create(createUserDto: CreateUserDto): Promise<DataUserResponseDto> {
    return this.userRepository.createUser(createUserDto);
  }

  async findAll(): Promise<DataUserResponseDto[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<DataUserResponseDto> {
    const cachedUser = await this.cacheManager.get<DataUserResponseDto>(
      `user_${id}`
    );

    if (cachedUser) return cachedUser;

    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    await this.cacheManager.set(`user_${id}`, user);

    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto
  ): Promise<DataUserResponseDto> {
    const updatedUser = await this.userRepository.updateUser(id, updateUserDto);

    if (!updatedUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.userRepository.removeUser(id);

    if (!deleted) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }
}
