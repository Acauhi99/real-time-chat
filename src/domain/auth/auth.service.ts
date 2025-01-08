import { UserRepository } from "../user/user.repository";
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { CreateUserDto } from "../user/dto/create-user.dto";
import { SignInDto } from "./dto/sign-in.dto";
import * as bcrypt from "bcrypt";
import { DataUserResponseDto } from "../user/dto/data-user-response.dto";
import { IJwtPayload } from "./strategies/jwt.strategy";
import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";

export interface AuthResponse {
  accessToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async signUp(createUserDto: CreateUserDto): Promise<DataUserResponseDto> {
    return this.userRepository.createUser(createUserDto);
  }

  async signIn(signInDto: SignInDto): Promise<AuthResponse> {
    const cacheKey = `user_${signInDto.email}`;
    let accessToken = await this.cacheManager.get<string>(cacheKey);

    if (!accessToken) {
      const user = await this.userRepository.findByEmail(signInDto.email);

      if (!user) {
        throw new UnauthorizedException("Invalid credentials");
      }

      const isPasswordValid = await bcrypt.compare(
        signInDto.password,
        user.password
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException("Invalid credentials");
      }

      const payload: IJwtPayload = { sub: user.userId, email: user.email };
      accessToken = this.jwtService.sign(payload);
      await this.cacheManager.set(cacheKey, accessToken);
    }

    return { accessToken };
  }
}
