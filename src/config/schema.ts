import { z } from "zod";

const environmentVariableSchema = z.object({});

export type EnvironmentVariable = z.infer<typeof environmentVariableSchema>;
