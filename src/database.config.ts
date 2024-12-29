import { DataSourceOptions } from "typeorm";
import { ConfigService } from "@nestjs/config";

export const getDatabaseConfig = (
  configService: ConfigService
): DataSourceOptions => ({
  type: "postgres",
  host: configService.get<string>("POSTGRES_HOST"),
  username: configService.get<string>("POSTGRES_USER"),
  port: configService.get<number>("POSTGRES_PORT"),
  password: configService.get<string>("POSTGRES_PASSWORD"),
  database: configService.get<string>("POSTGRES_DB"),
  entities: [__dirname + "/domain/**/*.model{.ts,.js}"],
  synchronize: true,
});
