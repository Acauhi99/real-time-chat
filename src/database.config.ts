import { DataSourceOptions } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { User } from "./user/user.model";

export const getDatabaseConfig = (
  configService: ConfigService
): DataSourceOptions => ({
  type: "postgres",
  host: "localhost",
  username: "postgres",
  port: configService.get<number>("POSTGRES_PORT"),
  password: configService.get<string>("POSTGRES_PASSWORD"),
  database: configService.get<string>("POSTGRES_DB"),
  entities: [User],
  synchronize: true,
});
