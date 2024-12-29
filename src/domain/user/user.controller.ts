import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
  ParseUUIDPipe,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { DataUserResponseDto } from "./dto/data-user-response.dto";

@Controller("user")
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<DataUserResponseDto> {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll(): Promise<DataUserResponseDto[]> {
    return this.userService.findAll();
  }

  @Get(":id")
  findOne(
    @Param("id", new ParseUUIDPipe()) id: string
  ): Promise<DataUserResponseDto | null> {
    return this.userService.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<DataUserResponseDto> {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id", new ParseUUIDPipe()) id: string): Promise<void> {
    return this.userService.remove(id);
  }
}
