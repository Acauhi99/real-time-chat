import { InjectRepository } from "@nestjs/typeorm";
import { UserRepository } from "./../user/user.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository
  ) {}
}
