import { z } from "zod";
/**
 * Single Tavily search result
 */
export declare const TavilyResultSchema: z.ZodObject<{
    title: z.ZodString;
    url: z.ZodString;
    content: z.ZodString;
    score: z.ZodNumber;
    published_date: z.ZodOptional<z.ZodString>;
    source: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    url: string;
    content: string;
    score: number;
    published_date?: string | undefined;
    source?: string | undefined;
}, {
    title: string;
    url: string;
    content: string;
    score: number;
    published_date?: string | undefined;
    source?: string | undefined;
}>;
export type TavilyResult = z.infer<typeof TavilyResultSchema>;
/**
 * Tavily API response
 */
export declare const TavilyResponseSchema: z.ZodObject<{
    query: z.ZodString;
    answer: z.ZodOptional<z.ZodString>;
    results: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        url: z.ZodString;
        content: z.ZodString;
        score: z.ZodNumber;
        published_date: z.ZodOptional<z.ZodString>;
        source: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        url: string;
        content: string;
        score: number;
        published_date?: string | undefined;
        source?: string | undefined;
    }, {
        title: string;
        url: string;
        content: string;
        score: number;
        published_date?: string | undefined;
        source?: string | undefined;
    }>, "many">;
    response_time: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    query: string;
    results: {
        title: string;
        url: string;
        content: string;
        score: number;
        published_date?: string | undefined;
        source?: string | undefined;
    }[];
    answer?: string | undefined;
    response_time?: number | undefined;
}, {
    query: string;
    results: {
        title: string;
        url: string;
        content: string;
        score: number;
        published_date?: string | undefined;
        source?: string | undefined;
    }[];
    answer?: string | undefined;
    response_time?: number | undefined;
}>;
export type TavilyResponse = z.infer<typeof TavilyResponseSchema>;
/**
 * Processed research context for synthesis step
 */
export declare const ResearchContextSchema: z.ZodObject<{
    query: z.ZodString;
    snippets: z.ZodArray<z.ZodObject<{
        source: z.ZodString;
        title: z.ZodString;
        url: z.ZodString;
        relevant_content: z.ZodString;
        confidence: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        title: string;
        url: string;
        source: string;
        relevant_content: string;
        confidence: number;
    }, {
        title: string;
        url: string;
        source: string;
        relevant_content: string;
        confidence: number;
    }>, "many">;
    total_results: z.ZodNumber;
    search_time_ms: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    query: string;
    snippets: {
        title: string;
        url: string;
        source: string;
        relevant_content: string;
        confidence: number;
    }[];
    total_results: number;
    search_time_ms: number;
}, {
    query: string;
    snippets: {
        title: string;
        url: string;
        source: string;
        relevant_content: string;
        confidence: number;
    }[];
    total_results: number;
    search_time_ms: number;
}>;
export type ResearchContext = z.infer<typeof ResearchContextSchema>;
//# sourceMappingURL=research.d.ts.map