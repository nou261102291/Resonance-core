export interface AppConfig {
    nebius: {
        apiKey: string;
        baseUrl: string;
        models: {
            triage: string;
            synthesis: string;
        };
    };
    tavily: {
        apiKey: string;
        baseUrl: string;
    };
    github: {
        appId: string;
        privateKey: string;
        webhookSecret: string;
    };
    server: {
        port: number;
        host: string;
        env: "development" | "staging" | "production";
    };
    autonomy: {
        defaultTier: 1 | 2 | 3;
        tier3AllowedPatterns: string[];
        tier1RequiredPatterns: string[];
    };
    costTracking: {
        enabled: boolean;
        rates: {
            nemotronNano: number;
            nemotronUltra: number;
        };
    };
}
export interface ProcessingContext {
    requestId: string;
    startTime: number;
    webhookPayload: unknown;
    failureContext: {
        repository: {
            owner: string;
            name: string;
            installationId?: number;
        };
        commit: {
            sha: string;
            branch: string;
        };
        errorLog: string;
    };
}
export interface ProcessingResult {
    success: boolean;
    requestId: string;
    durationMs: number;
    triage?: unknown;
    research?: unknown;
    synthesis?: unknown;
    githubAction?: {
        type: "draft_pr" | "pr" | "push_dev" | "auto_merge";
        prUrl?: string;
        prNumber?: number;
    };
    costReceipt?: unknown;
    error?: string;
}
export type LogLevel = "debug" | "info" | "warn" | "error";
export interface StructuredLog {
    level: LogLevel;
    message: string;
    requestId?: string;
    timestamp: string;
    metadata?: Record<string, unknown>;
}
//# sourceMappingURL=index.d.ts.map