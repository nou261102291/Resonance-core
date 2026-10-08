import { z } from 'zod';

export const ApiReadinessSchema = z.object({
  status: z.enum(['ready', 'not_ready']),
  checks: z.object({
    config: z.boolean(),
    nebius: z.boolean(),
    tavily: z.boolean(),
    github: z.boolean(),
  }).strict(),
  timestamp: z.string().datetime(),
}).strict();

export type ApiReadiness = z.infer<typeof ApiReadinessSchema>;

export const DashboardHealthSchema = z.discriminatedUnion('status', [
  ApiReadinessSchema,
  z.object({ status: z.literal('unavailable') }).strict(),
]);

export type DashboardHealth = z.infer<typeof DashboardHealthSchema>;