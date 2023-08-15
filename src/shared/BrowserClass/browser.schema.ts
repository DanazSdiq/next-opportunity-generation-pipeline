import { z } from "zod";

export const pageConfigSchema = z.object({
  url: z
    .string({ required_error: "URL is required" })
    .url({ message: "Invalid URL" }),

  waitForSelector: z.string().optional()
});

export type PageConfig = z.infer<typeof pageConfigSchema>;
