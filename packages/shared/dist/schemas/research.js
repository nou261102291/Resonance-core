// packages/shared/src/schemas/research.ts
// Zod schemas for Tavily research results
import { z } from "zod";
/**
 * Single Tavily search result
 */
export const TavilyResultSchema = z.object({
    title: z.string().max(500),
    url: z.string().url(),
    content: z.string().max(10000),
    score: z.number().min(0).max(1),
    published_date: z.string().optional(),
    source: z.string().optional(),
});
/**
 * Tavily API response
 */
export const TavilyResponseSchema = z.object({
    query: z.string(),
    answer: z.string().optional(),
    results: z.array(TavilyResultSchema),
    response_time: z.number().optional(),
});
/**
 * Processed research context for synthesis step
 */
export const ResearchContextSchema = z.object({
    query: z.string(),
    snippets: z.array(z.object({
        source: z.string(),
        title: z.string(),
        url: z.string().url(),
        relevant_content: z.string().max(5000),
        confidence: z.number().min(0).max(1),
    })),
    total_results: z.number().int().min(0),
    search_time_ms: z.number().int().min(0),
});
//# sourceMappingURL=research.js.map