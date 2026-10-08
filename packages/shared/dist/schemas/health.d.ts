import { z } from 'zod';
export declare const ApiReadinessSchema: z.ZodObject<{
    status: z.ZodEnum<["ready", "not_ready"]>;
    checks: z.ZodObject<{
        config: z.ZodBoolean;
        nebius: z.ZodBoolean;
        tavily: z.ZodBoolean;
        github: z.ZodBoolean;
    }, "strict", z.ZodTypeAny, {
        config: boolean;
        nebius: boolean;
        tavily: boolean;
        github: boolean;
    }, {
        config: boolean;
        nebius: boolean;
        tavily: boolean;
        github: boolean;
    }>;
    timestamp: z.ZodString;
}, "strict", z.ZodTypeAny, {
    status: "ready" | "not_ready";
    timestamp: string;
    checks: {
        config: boolean;
        nebius: boolean;
        tavily: boolean;
        github: boolean;
    };
}, {
    status: "ready" | "not_ready";
    timestamp: string;
    checks: {
        config: boolean;
        nebius: boolean;
        tavily: boolean;
        github: boolean;
    };
}>;
export type ApiReadiness = z.infer<typeof ApiReadinessSchema>;
export declare const DashboardHealthSchema: z.ZodDiscriminatedUnion<"status", [z.ZodObject<{
    status: z.ZodEnum<["ready", "not_ready"]>;
    checks: z.ZodObject<{
        config: z.ZodBoolean;
        nebius: z.ZodBoolean;
        tavily: z.ZodBoolean;
        github: z.ZodBoolean;
    }, "strict", z.ZodTypeAny, {
        config: boolean;
        nebius: boolean;
        tavily: boolean;
        github: boolean;
    }, {
        config: boolean;
        nebius: boolean;
        tavily: boolean;
        github: boolean;
    }>;
    timestamp: z.ZodString;
}, "strict", z.ZodTypeAny, {
    status: "ready" | "not_ready";
    timestamp: string;
    checks: {
        config: boolean;
        nebius: boolean;
        tavily: boolean;
        github: boolean;
    };
}, {
    status: "ready" | "not_ready";
    timestamp: string;
    checks: {
        config: boolean;
        nebius: boolean;
        tavily: boolean;
        github: boolean;
    };
}>, z.ZodObject<{
    status: z.ZodLiteral<"unavailable">;
}, "strict", z.ZodTypeAny, {
    status: "unavailable";
}, {
    status: "unavailable";
}>]>;
export type DashboardHealth = z.infer<typeof DashboardHealthSchema>;
//# sourceMappingURL=health.d.ts.map