import { ConfigService } from "@nestjs/config";
import { config } from "dotenv";
import { getDatabaseConfig } from "./database.config";
import { DataSource } from "typeorm";

config();

const configService = new ConfigService();

export const AppDataSource = new DataSource(getDatabaseConfig(configService));
