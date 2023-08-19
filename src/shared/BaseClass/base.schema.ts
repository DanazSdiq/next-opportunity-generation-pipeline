import { z } from "zod";

const cacheConfigSchema = z.object({
  shouldCachePages: z.boolean(),
  shouldReadFromCache: z.boolean()
});

const organizationSchema = z.object({
  name: z.string(),
  main_url: z.string().url(),
  created_at: z.string()
});

export type CacheConfig = z.infer<typeof cacheConfigSchema>;
export type Organization = z.infer<typeof organizationSchema>;
