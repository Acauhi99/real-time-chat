import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "./user.service";
import { UserRepository } from "./user.repository";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { DataUserResponseDto } from "./dto/data-user-response.dto";
import { NotFoundException, ConflictException } from "@nestjs/common";

const mockUserRepository = () => ({
  createUser: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  updateUser: jest.fn(),
  removeUser: jest.fn(),
});

describe("UserService", () => {
  let userService: UserService;
  let userRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useFactory: mockUserRepository },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("create", () => {
    it("deve criar um usuário com sucesso", async () => {
      const createUserDto: CreateUserDto = {
        email: "john.doe@example.com",
        name: "John Doe",
        password: "password123",
      };

      const savedUser: DataUserResponseDto = {
        userId: "3fee99a1-58de-4fd8-b104-607a5a08630e",
        name: "John Doe",
        email: "john.doe@example.com",
      };

      userRepository.createUser.mockResolvedValue(savedUser);

      const result = await userService.create(createUserDto);
      expect(userRepository.createUser).toHaveBeenCalledWith({
        ...createUserDto,
        password: expect.any(String),
      });
      expect(result).toEqual(savedUser);
    });

    it("deve lançar ConflictException se o email já existir", async () => {
      const createUserDto: CreateUserDto = {
        email: "john.doe@example.com",
        name: "John Doe",
        password: "password123",
      };

      userRepository.createUser.mockRejectedValue(
        new ConflictException(
          `User with email ${createUserDto.email} already exists`
        )
      );

      await expect(userService.create(createUserDto)).rejects.toThrow(
        ConflictException
      );
      expect(userRepository.createUser).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe("findAll", () => {
    it("deve retornar todos os usuários", async () => {
      const users: DataUserResponseDto[] = [
        {
          userId: "id-1",
          name: "John Doe",
          email: "john.doe@example.com",
        },
        {
          userId: "id-2",
          name: "Jane Smith",
          email: "jane.smith@example.com",
        },
      ];

      userRepository.find.mockResolvedValue(users);

      const result = await userService.findAll();
      expect(userRepository.find).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe("findOne", () => {
    it("deve retornar um usuário por ID", async () => {
      const userId = "3fee99a1-58de-4fd8-b104-607a5a08630e";
      const user: DataUserResponseDto = {
        userId,
        name: "John Doe",
        email: "john.doe@example.com",
      };

      userRepository.findById.mockResolvedValue(user);

      const result = await userService.findOne(userId);
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(user);
    });

    it("deve lançar NotFoundException se o usuário não existir", async () => {
      const userId = "non-existent-id";

      userRepository.findById.mockResolvedValue(null);

      await expect(userService.findOne(userId)).rejects.toThrow(
        NotFoundException
      );
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
    });
  });

  describe("update", () => {
    it("deve atualizar um usuário com sucesso", async () => {
      const userId = "3fee99a1-58de-4fd8-b104-607a5a08630e";
      const updateUserDto: UpdateUserDto = {
        name: "John Updated",
        email: "john.updated@example.com",
        password: "newpassword123",
      };

      const updatedUser: DataUserResponseDto = {
        userId,
        name: "John Updated",
        email: "john.updated@example.com",
      };

      userRepository.updateUser.mockResolvedValue(updatedUser);

      const result = await userService.update(userId, updateUserDto);
      expect(userRepository.updateUser).toHaveBeenCalledWith(userId, {
        ...updateUserDto,
        password: expect.any(String),
      });
      expect(result).toEqual(updatedUser);
    });

    it("deve lançar NotFoundException se o usuário a ser atualizado não existir", async () => {
      const userId = "non-existent-id";
      const updateUserDto: UpdateUserDto = {
        name: "John Updated",
      };

      userRepository.updateUser.mockResolvedValue(null);

      await expect(userService.update(userId, updateUserDto)).rejects.toThrow(
        NotFoundException
      );
      expect(userRepository.updateUser).toHaveBeenCalledWith(
        userId,
        updateUserDto
      );
    });
  });

  describe("remove", () => {
    it("deve remover um usuário com sucesso", async () => {
      const userId = "3fee99a1-58de-4fd8-b104-607a5a08630e";

      userRepository.removeUser.mockResolvedValue(true);

      await expect(userService.remove(userId)).resolves.toBeUndefined();
      expect(userRepository.removeUser).toHaveBeenCalledWith(userId);
    });

    it("deve lançar NotFoundException se o usuário a ser removido não existir", async () => {
      const userId = "non-existent-id";

      userRepository.removeUser.mockResolvedValue(false);

      await expect(userService.remove(userId)).rejects.toThrow(
        NotFoundException
      );
      expect(userRepository.removeUser).toHaveBeenCalledWith(userId);
    });
  });
});
