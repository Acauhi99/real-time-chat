import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserRepository } from "../../user/user.repository";
import { IJwtPayload } from "../interface/jwt-payload.interface";
import { User } from "../../user/user.model";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userRepository: UserRepository,
    protected readonly configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>("JWT_SECRET"),
      ignoreExpiration: false,
    });
  }

  async validate(payload: IJwtPayload): Promise<User> {
    const { email: userEmail } = payload;

    const user = await this.userRepository.findByEmail(userEmail);

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return user;
  }
}
