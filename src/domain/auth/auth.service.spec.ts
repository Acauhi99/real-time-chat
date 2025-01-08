import { Test, TestingModule } from "@nestjs/testing";
import { AuthService, AuthResponse } from "./auth.service";
import { UserRepository } from "../user/user.repository";
import { JwtService } from "@nestjs/jwt";
import { CreateUserDto } from "../user/dto/create-user.dto";
import { SignInDto } from "./dto/sign-in.dto";
import { DataUserResponseDto } from "../user/dto/data-user-response.dto";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { CacheModule, Cache } from "@nestjs/cache-manager";
import * as bcrypt from "bcrypt";

jest.mock("bcrypt");

const mockUserRepository = () => ({
  createUser: jest.fn(),
  findByEmail: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(),
});

const mockCacheManager = {
  get: jest.fn(),
  set: jest.fn(),
};

describe("AuthService", () => {
  let authService: AuthService;
  let userRepository: any;
  let jwtService: any;
  let cacheManager: Cache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        AuthService,
        { provide: UserRepository, useFactory: mockUserRepository },
        { provide: JwtService, useFactory: mockJwtService },
        { provide: Cache, useValue: mockCacheManager },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(UserRepository);
    jwtService = module.get<JwtService>(JwtService);
    cacheManager = module.get<Cache>(Cache);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("signUp", () => {
    it("deve criar um usuário com sucesso", async () => {
      const createUserDto: CreateUserDto = {
        email: "john.doe@example.com",
        name: "John Doe",
        password: "password123",
      };

      const createdUser: DataUserResponseDto = {
        userId: "uuid-1234",
        name: "John Doe",
        email: "john.doe@example.com",
      };

      userRepository.createUser.mockResolvedValue(createdUser);

      const result = await authService.signUp(createUserDto);
      expect(userRepository.createUser).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(createdUser);
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

      await expect(authService.signUp(createUserDto)).rejects.toThrow(
        ConflictException
      );
      expect(userRepository.createUser).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe("signIn", () => {
    it("deve retornar um token de acesso com sucesso", async () => {
      const signInDto: SignInDto = {
        email: "john.doe@example.com",
        password: "password123",
      };

      const user: DataUserResponseDto & { password: string } = {
        userId: "uuid-1234",
        name: "John Doe",
        email: "john.doe@example.com",
        password: "hashedpassword123",
      };

      const payload = { sub: user.userId, email: user.email };

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue("jwt-token");

      userRepository.findByEmail.mockResolvedValue(user);

      const result: AuthResponse = await authService.signIn(signInDto);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(signInDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        signInDto.password,
        user.password
      );
      expect(jwtService.sign).toHaveBeenCalledWith(payload);
      expect(result).toEqual({ accessToken: "jwt-token" });
    });

    it("deve lançar UnauthorizedException se o usuário não for encontrado", async () => {
      const signInDto: SignInDto = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      userRepository.findByEmail.mockResolvedValue(null);

      await expect(authService.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException
      );

      expect(userRepository.findByEmail).toHaveBeenCalledWith(signInDto.email);
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it("deve lançar UnauthorizedException se a senha for inválida", async () => {
      const signInDto: SignInDto = {
        email: "john.doe@example.com",
        password: "wrongpassword",
      };

      const user: DataUserResponseDto & { password: string } = {
        userId: "uuid-1234",
        name: "John Doe",
        email: "john.doe@example.com",
        password: "hashedpassword123",
      };

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      userRepository.findByEmail.mockResolvedValue(user);

      await expect(authService.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException
      );

      expect(userRepository.findByEmail).toHaveBeenCalledWith(signInDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        signInDto.password,
        user.password
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });
});
