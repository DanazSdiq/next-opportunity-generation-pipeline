import { z } from "zod";

const cacheConfigSchema = z.object({
  shouldCachePages: z.boolean(),
  shouldReadFromCache: z.boolean()
});

export type CacheConfig = z.infer<typeof cacheConfigSchema>;
