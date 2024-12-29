import { UserRepository } from "../user/user.repository";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { CreateUserDto } from "../user/dto/create-user.dto";
import { SignInDto } from "./dto/sign-in.dto";
import * as bcrypt from "bcrypt";
import { DataUserResponseDto } from "../user/dto/data-user-response.dto";
import { IJwtPayload } from "./strategies/jwt.strategy";

export interface AuthResponse {
  accessToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService
  ) {}

  async signUp(createUserDto: CreateUserDto): Promise<DataUserResponseDto> {
    return this.userRepository.createUser(createUserDto);
  }

  async signIn(signInDto: SignInDto): Promise<AuthResponse> {
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

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
