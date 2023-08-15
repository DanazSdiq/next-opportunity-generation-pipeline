import dotenv from "dotenv";
import { EnvironmentVariable } from "./schema";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

export const env: EnvironmentVariable = {};
