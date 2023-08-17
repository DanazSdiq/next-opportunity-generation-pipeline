import { z } from "zod";

const scraperSchema = z.object({
  initUrl: z.string(),
  urls: z.array(z.string()),
  waitForSelector: z.string().optional()
});

export type Scraper = z.infer<typeof scraperSchema>;

const opportunitySchema = z.object({
  id: z.string().uuid(),
  organization_name: z.string(),
  title: z.string(),
  url: z.string(),
  description: z.string(),
  labels: z.array(z.string()),
  commitment: z.union([
    z.literal("full-time"),
    z.literal("part-time"),
    z.literal("contract"),
    z.literal("unknown")
  ])
});
const commitmentSchema = opportunitySchema.pick({ commitment: true });

export type Opportunity = z.infer<typeof opportunitySchema>;

export type OpportunityCommitment = z.infer<typeof commitmentSchema>;

export const mytype: OpportunityCommitment = { commitment: "part-time" };
