import { z } from 'zod';
declare const ConfigSchema: z.ZodObject<{
    port: z.ZodDefault<z.ZodNumber>;
    host: z.ZodDefault<z.ZodString>;
    env: z.ZodDefault<z.ZodEnum<["development", "staging", "production"]>>;
    nebius: z.ZodObject<{
        apiKey: z.ZodString;
        baseUrl: z.ZodDefault<z.ZodString>;
        models: z.ZodObject<{
            triage: z.ZodDefault<z.ZodString>;
            synthesis: z.ZodDefault<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            triage: string;
            synthesis: string;
        }, {
            triage?: string | undefined;
            synthesis?: string | undefined;
        }>;
        timeoutMs: z.ZodDefault<z.ZodNumber>;
        maxRetries: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        apiKey: string;
        baseUrl: string;
        models: {
            triage: string;
            synthesis: string;
        };
        timeoutMs: number;
        maxRetries: number;
    }, {
        apiKey: string;
        models: {
            triage?: string | undefined;
            synthesis?: string | undefined;
        };
        baseUrl?: string | undefined;
        timeoutMs?: number | undefined;
        maxRetries?: number | undefined;
    }>;
    tavily: z.ZodObject<{
        apiKey: z.ZodString;
        baseUrl: z.ZodDefault<z.ZodString>;
        searchDepth: z.ZodDefault<z.ZodEnum<["basic", "advanced"]>>;
        maxResults: z.ZodDefault<z.ZodNumber>;
        includeDomains: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        excludeDomains: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        timeoutMs: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        apiKey: string;
        baseUrl: string;
        timeoutMs: number;
        searchDepth: "basic" | "advanced";
        maxResults: number;
        includeDomains: string[];
        excludeDomains: string[];
    }, {
        apiKey: string;
        baseUrl?: string | undefined;
        timeoutMs?: number | undefined;
        searchDepth?: "basic" | "advanced" | undefined;
        maxResults?: number | undefined;
        includeDomains?: string[] | undefined;
        excludeDomains?: string[] | undefined;
    }>;
    github: z.ZodObject<{
        appId: z.ZodString;
        privateKey: z.ZodString;
        webhookSecret: z.ZodString;
        clientId: z.ZodOptional<z.ZodString>;
        clientSecret: z.ZodOptional<z.ZodString>;
        defaultPermissions: z.ZodDefault<z.ZodObject<{
            contents: z.ZodLiteral<"write">;
            pull_requests: z.ZodLiteral<"write">;
            actions: z.ZodLiteral<"read">;
            metadata: z.ZodLiteral<"read">;
            checks: z.ZodLiteral<"read">;
        }, "strip", z.ZodTypeAny, {
            contents: "write";
            pull_requests: "write";
            actions: "read";
            metadata: "read";
            checks: "read";
        }, {
            contents: "write";
            pull_requests: "write";
            actions: "read";
            metadata: "read";
            checks: "read";
        }>>;
    }, "strip", z.ZodTypeAny, {
        appId: string;
        privateKey: string;
        webhookSecret: string;
        defaultPermissions: {
            contents: "write";
            pull_requests: "write";
            actions: "read";
            metadata: "read";
            checks: "read";
        };
        clientId?: string | undefined;
        clientSecret?: string | undefined;
    }, {
        appId: string;
        privateKey: string;
        webhookSecret: string;
        clientId?: string | undefined;
        clientSecret?: string | undefined;
        defaultPermissions?: {
            contents: "write";
            pull_requests: "write";
            actions: "read";
            metadata: "read";
            checks: "read";
        } | undefined;
    }>;
    autonomy: z.ZodObject<{
        defaultTier: z.ZodDefault<z.ZodNumber>;
        tier1RequiredPatterns: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        tier3AllowedPatterns: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        riskThresholds: z.ZodObject<{
            tier1Min: z.ZodDefault<z.ZodNumber>;
            tier3Max: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            tier1Min: number;
            tier3Max: number;
        }, {
            tier1Min?: number | undefined;
            tier3Max?: number | undefined;
        }>;
        confidenceThresholds: z.ZodObject<{
            tier1Max: z.ZodDefault<z.ZodNumber>;
            tier3Min: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            tier1Max: number;
            tier3Min: number;
        }, {
            tier1Max?: number | undefined;
            tier3Min?: number | undefined;
        }>;
        changeLimits: z.ZodObject<{
            tier3MaxLines: z.ZodDefault<z.ZodNumber>;
            tier1MinLines: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            tier3MaxLines: number;
            tier1MinLines: number;
        }, {
            tier3MaxLines?: number | undefined;
            tier1MinLines?: number | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        defaultTier: number;
        tier1RequiredPatterns: string[];
        tier3AllowedPatterns: string[];
        riskThresholds: {
            tier1Min: number;
            tier3Max: number;
        };
        confidenceThresholds: {
            tier1Max: number;
            tier3Min: number;
        };
        changeLimits: {
            tier3MaxLines: number;
            tier1MinLines: number;
        };
    }, {
        riskThresholds: {
            tier1Min?: number | undefined;
            tier3Max?: number | undefined;
        };
        confidenceThresholds: {
            tier1Max?: number | undefined;
            tier3Min?: number | undefined;
        };
        changeLimits: {
            tier3MaxLines?: number | undefined;
            tier1MinLines?: number | undefined;
        };
        defaultTier?: number | undefined;
        tier1RequiredPatterns?: string[] | undefined;
        tier3AllowedPatterns?: string[] | undefined;
    }>;
    costTracking: z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        rates: z.ZodObject<{
            nemotronNano: z.ZodDefault<z.ZodNumber>;
            nemotronUltra: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            nemotronNano: number;
            nemotronUltra: number;
        }, {
            nemotronNano?: number | undefined;
            nemotronUltra?: number | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        rates: {
            nemotronNano: number;
            nemotronUltra: number;
        };
    }, {
        rates: {
            nemotronNano?: number | undefined;
            nemotronUltra?: number | undefined;
        };
        enabled?: boolean | undefined;
    }>;
    security: z.ZodObject<{
        logSanitization: z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            patterns: z.ZodDefault<z.ZodArray<z.ZodObject<{
                pattern: z.ZodString;
                replacement: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                pattern: string;
                replacement: string;
            }, {
                pattern: string;
                replacement: string;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            patterns: {
                pattern: string;
                replacement: string;
            }[];
        }, {
            enabled?: boolean | undefined;
            patterns?: {
                pattern: string;
                replacement: string;
            }[] | undefined;
        }>;
        allowedEgressDomains: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        logSanitization: {
            enabled: boolean;
            patterns: {
                pattern: string;
                replacement: string;
            }[];
        };
        allowedEgressDomains: string[];
    }, {
        logSanitization: {
            enabled?: boolean | undefined;
            patterns?: {
                pattern: string;
                replacement: string;
            }[] | undefined;
        };
        allowedEgressDomains?: string[] | undefined;
    }>;
    logging: z.ZodObject<{
        level: z.ZodDefault<z.ZodEnum<["debug", "info", "warn", "error"]>>;
        prettyPrint: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        level: "debug" | "info" | "warn" | "error";
        prettyPrint: boolean;
    }, {
        level?: "debug" | "info" | "warn" | "error" | undefined;
        prettyPrint?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    port: number;
    host: string;
    env: "development" | "staging" | "production";
    nebius: {
        apiKey: string;
        baseUrl: string;
        models: {
            triage: string;
            synthesis: string;
        };
        timeoutMs: number;
        maxRetries: number;
    };
    tavily: {
        apiKey: string;
        baseUrl: string;
        timeoutMs: number;
        searchDepth: "basic" | "advanced";
        maxResults: number;
        includeDomains: string[];
        excludeDomains: string[];
    };
    github: {
        appId: string;
        privateKey: string;
        webhookSecret: string;
        defaultPermissions: {
            contents: "write";
            pull_requests: "write";
            actions: "read";
            metadata: "read";
            checks: "read";
        };
        clientId?: string | undefined;
        clientSecret?: string | undefined;
    };
    autonomy: {
        defaultTier: number;
        tier1RequiredPatterns: string[];
        tier3AllowedPatterns: string[];
        riskThresholds: {
            tier1Min: number;
            tier3Max: number;
        };
        confidenceThresholds: {
            tier1Max: number;
            tier3Min: number;
        };
        changeLimits: {
            tier3MaxLines: number;
            tier1MinLines: number;
        };
    };
    costTracking: {
        enabled: boolean;
        rates: {
            nemotronNano: number;
            nemotronUltra: number;
        };
    };
    security: {
        logSanitization: {
            enabled: boolean;
            patterns: {
                pattern: string;
                replacement: string;
            }[];
        };
        allowedEgressDomains: string[];
    };
    logging: {
        level: "debug" | "info" | "warn" | "error";
        prettyPrint: boolean;
    };
}, {
    nebius: {
        apiKey: string;
        models: {
            triage?: string | undefined;
            synthesis?: string | undefined;
        };
        baseUrl?: string | undefined;
        timeoutMs?: number | undefined;
        maxRetries?: number | undefined;
    };
    tavily: {
        apiKey: string;
        baseUrl?: string | undefined;
        timeoutMs?: number | undefined;
        searchDepth?: "basic" | "advanced" | undefined;
        maxResults?: number | undefined;
        includeDomains?: string[] | undefined;
        excludeDomains?: string[] | undefined;
    };
    github: {
        appId: string;
        privateKey: string;
        webhookSecret: string;
        clientId?: string | undefined;
        clientSecret?: string | undefined;
        defaultPermissions?: {
            contents: "write";
            pull_requests: "write";
            actions: "read";
            metadata: "read";
            checks: "read";
        } | undefined;
    };
    autonomy: {
        riskThresholds: {
            tier1Min?: number | undefined;
            tier3Max?: number | undefined;
        };
        confidenceThresholds: {
            tier1Max?: number | undefined;
            tier3Min?: number | undefined;
        };
        changeLimits: {
            tier3MaxLines?: number | undefined;
            tier1MinLines?: number | undefined;
        };
        defaultTier?: number | undefined;
        tier1RequiredPatterns?: string[] | undefined;
        tier3AllowedPatterns?: string[] | undefined;
    };
    costTracking: {
        rates: {
            nemotronNano?: number | undefined;
            nemotronUltra?: number | undefined;
        };
        enabled?: boolean | undefined;
    };
    security: {
        logSanitization: {
            enabled?: boolean | undefined;
            patterns?: {
                pattern: string;
                replacement: string;
            }[] | undefined;
        };
        allowedEgressDomains?: string[] | undefined;
    };
    logging: {
        level?: "debug" | "info" | "warn" | "error" | undefined;
        prettyPrint?: boolean | undefined;
    };
    port?: number | undefined;
    host?: string | undefined;
    env?: "development" | "staging" | "production" | undefined;
}>;
export type Config = z.infer<typeof ConfigSchema>;
export declare const config: {
    port: number;
    host: string;
    env: "development" | "staging" | "production";
    nebius: {
        apiKey: string;
        baseUrl: string;
        models: {
            triage: string;
            synthesis: string;
        };
        timeoutMs: number;
        maxRetries: number;
    };
    tavily: {
        apiKey: string;
        baseUrl: string;
        timeoutMs: number;
        searchDepth: "basic" | "advanced";
        maxResults: number;
        includeDomains: string[];
        excludeDomains: string[];
    };
    github: {
        appId: string;
        privateKey: string;
        webhookSecret: string;
        defaultPermissions: {
            contents: "write";
            pull_requests: "write";
            actions: "read";
            metadata: "read";
            checks: "read";
        };
        clientId?: string | undefined;
        clientSecret?: string | undefined;
    };
    autonomy: {
        defaultTier: number;
        tier1RequiredPatterns: string[];
        tier3AllowedPatterns: string[];
        riskThresholds: {
            tier1Min: number;
            tier3Max: number;
        };
        confidenceThresholds: {
            tier1Max: number;
            tier3Min: number;
        };
        changeLimits: {
            tier3MaxLines: number;
            tier1MinLines: number;
        };
    };
    costTracking: {
        enabled: boolean;
        rates: {
            nemotronNano: number;
            nemotronUltra: number;
        };
    };
    security: {
        logSanitization: {
            enabled: boolean;
            patterns: {
                pattern: string;
                replacement: string;
            }[];
        };
        allowedEgressDomains: string[];
    };
    logging: {
        level: "debug" | "info" | "warn" | "error";
        prettyPrint: boolean;
    };
};
export {};
//# sourceMappingURL=config.d.ts.map