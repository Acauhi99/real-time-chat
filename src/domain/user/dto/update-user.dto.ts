import { PartialType } from "@nestjs/mapped-types";
import { CreateUserDto } from "./create-user.dto";
import { IsEmail, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(25)
  name?: string;

  @IsOptional()
  @IsString()
  @Min(8)
  password?: string;
}
