import { CreateUserDto } from "../user/dto/create-user.dto";
import { AuthResponse, AuthService } from "./auth.service";
import { Body, Controller, Post } from "@nestjs/common";
import { SignInDto } from "./dto/sign-in.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  async signUp(@Body() createUserDto: CreateUserDto): Promise<void> {
    await this.authService.signUp(createUserDto);
  }

  @Post("signin")
  async signIn(@Body() signInDto: SignInDto): Promise<AuthResponse> {
    return await this.authService.signIn(signInDto);
  }
}
