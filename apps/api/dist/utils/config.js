import { z } from 'zod';
const ConfigSchema = z.object({
    // Server
    port: z.coerce.number().default(3000),
    host: z.string().default('0.0.0.0'),
    env: z.enum(['development', 'staging', 'production']).default('development'),
    // Nebius AI Studio
    nebius: z.object({
        apiKey: z.string().min(1, 'NEBIUS_API_KEY is required'),
        baseUrl: z.string().url().default('https://api.studio.nebius.com/v1'),
        models: z.object({
            triage: z.string().default('nvidia/nemotron-nano'),
            synthesis: z.string().default('nvidia/nemotron-3-ultra'),
        }),
        timeoutMs: z.coerce.number().default(30000),
        maxRetries: z.coerce.number().default(3),
    }),
    // Tavily Search API
    tavily: z.object({
        apiKey: z.string().min(1, 'TAVILY_API_KEY is required'),
        baseUrl: z.string().url().default('https://api.tavily.com'),
        searchDepth: z.enum(['basic', 'advanced']).default('advanced'),
        maxResults: z.coerce.number().default(3),
        includeDomains: z.array(z.string()).default([
            'github.com',
            'stackoverflow.com',
            'dev.to',
            'medium.com',
        ]),
        excludeDomains: z.array(z.string()).default([
            'pinterest.com',
            'quora.com',
        ]),
        timeoutMs: z.coerce.number().default(15000),
    }),
    // GitHub App
    github: z.object({
        appId: z.string().min(1, 'GITHUB_APP_ID is required'),
        privateKey: z.string().min(1, 'GITHUB_PRIVATE_KEY is required'),
        webhookSecret: z.string().min(1, 'GITHUB_WEBHOOK_SECRET is required'),
        clientId: z.string().optional(),
        clientSecret: z.string().optional(),
        // Default permissions for installation token
        defaultPermissions: z.object({
            contents: z.literal('write'),
            pull_requests: z.literal('write'),
            actions: z.literal('read'),
            metadata: z.literal('read'),
            checks: z.literal('read'),
        }).default({
            contents: 'write',
            pull_requests: 'write',
            actions: 'read',
            metadata: 'read',
            checks: 'read',
        }),
    }),
    // Autonomy Configuration
    autonomy: z.object({
        defaultTier: z.number().int().min(1).max(3).default(2),
        tier1RequiredPatterns: z.array(z.string()).default([
            '**/auth/**',
            '**/database/**',
            '**/billing/**',
            '**/migrations/**',
            '**/.github/workflows/**',
        ]),
        tier3AllowedPatterns: z.array(z.string()).default([
            '*.eslintrc*',
            '*.prettierrc*',
            '**/*.test.ts',
            '**/*.spec.ts',
            '*.md',
        ]),
        riskThresholds: z.object({
            tier1Min: z.number().int().min(1).max(10).default(7),
            tier3Max: z.number().int().min(1).max(10).default(3),
        }),
        confidenceThresholds: z.object({
            tier1Max: z.number().int().min(1).max(10).default(6),
            tier3Min: z.number().int().min(1).max(10).default(9),
        }),
        changeLimits: z.object({
            tier3MaxLines: z.number().int().min(1).default(5),
            tier1MinLines: z.number().int().min(1).default(50),
        }),
    }),
    // Cost Tracking
    costTracking: z.object({
        enabled: z.boolean().default(true),
        rates: z.object({
            nemotronNano: z.number().default(0.0001), // per 1K tokens
            nemotronUltra: z.number().default(0.0005), // per 1K tokens
        }),
    }),
    // Security
    security: z.object({
        logSanitization: z.object({
            enabled: z.boolean().default(true),
            patterns: z.array(z.object({
                pattern: z.string(),
                replacement: z.string(),
            })).default([
                { pattern: 'AKIA[0-9A-Z]{16}', replacement: '[AWS_KEY_REDACTED]' },
                { pattern: 'aws_secret_access_key[\\s:=]+[A-Za-z0-9/+=]{40}', replacement: '[AWS_SECRET_REDACTED]' },
                { pattern: 'eyJ[A-Za-z0-9_-]*\\.[A-Za-z0-9_-]*\\.[A-Za-z0-9_-]*', replacement: '[JWT_REDACTED]' },
                { pattern: 'Bearer\\s+[A-Za-z0-9_-]+', replacement: '[BEARER_TOKEN_REDACTED]' },
                { pattern: '(postgres|mysql|mongodb|redis)://[^\\s]+', replacement: '[DB_URL_REDACTED]' },
                { pattern: '(api_key|secret|password|token)[\\s:=]+[A-Za-z0-9_-]+', replacement: '[SECRET_REDACTED]' },
            ]),
        }),
        allowedEgressDomains: z.array(z.string()).default([
            'api.studio.nebius.com',
            'api.tavily.com',
            'api.github.com',
        ]),
    }),
    // Logging
    logging: z.object({
        level: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
        prettyPrint: z.boolean().default(true),
    }),
});
function loadConfig() {
    const rawConfig = {
        port: process.env.PORT,
        host: process.env.HOST,
        env: process.env.NODE_ENV,
        nebius: {
            apiKey: process.env.NEBIUS_API_KEY,
            baseUrl: process.env.NEBIUS_BASE_URL,
            models: {
                triage: process.env.NEBIUS_TRIAGE_MODEL,
                synthesis: process.env.NEBIUS_SYNTHESIS_MODEL,
            },
            timeoutMs: process.env.NEBIUS_TIMEOUT_MS,
            maxRetries: process.env.NEBIUS_MAX_RETRIES,
        },
        tavily: {
            apiKey: process.env.TAVILY_API_KEY,
            baseUrl: process.env.TAVILY_BASE_URL,
            searchDepth: process.env.TAVILY_SEARCH_DEPTH,
            maxResults: process.env.TAVILY_MAX_RESULTS,
            includeDomains: process.env.TAVILY_INCLUDE_DOMAINS?.split(',').filter(Boolean),
            excludeDomains: process.env.TAVILY_EXCLUDE_DOMAINS?.split(',').filter(Boolean),
            timeoutMs: process.env.TAVILY_TIMEOUT_MS,
        },
        github: {
            appId: process.env.GITHUB_APP_ID,
            privateKey: process.env.GITHUB_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            webhookSecret: process.env.GITHUB_WEBHOOK_SECRET,
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
        },
        autonomy: {
            defaultTier: process.env.DEFAULT_AUTONOMY_TIER,
            tier1RequiredPatterns: process.env.TIER1_REQUIRED_PATTERNS?.split(',').filter(Boolean),
            tier3AllowedPatterns: process.env.TIER3_ALLOWED_PATTERNS?.split(',').filter(Boolean),
            riskThresholds: {
                tier1Min: process.env.RISK_THRESHOLD_TIER1_MIN,
                tier3Max: process.env.RISK_THRESHOLD_TIER3_MAX,
            },
            confidenceThresholds: {
                tier1Max: process.env.CONFIDENCE_THRESHOLD_TIER1_MAX,
                tier3Min: process.env.CONFIDENCE_THRESHOLD_TIER3_MIN,
            },
            changeLimits: {
                tier3MaxLines: process.env.CHANGE_LIMIT_TIER3_MAX_LINES,
                tier1MinLines: process.env.CHANGE_LIMIT_TIER1_MIN_LINES,
            },
        },
        costTracking: {
            enabled: process.env.COST_TRACKING_ENABLED,
            rates: {
                nemotronNano: process.env.COST_RATE_NEMOTRON_NANO,
                nemotronUltra: process.env.COST_RATE_NEMOTRON_ULTRA,
            },
        },
        security: {
            logSanitization: {
                enabled: process.env.LOG_SANITIZATION_ENABLED,
            },
            allowedEgressDomains: process.env.ALLOWED_EGRESS_DOMAINS?.split(',').filter(Boolean),
        },
        logging: {
            level: process.env.LOG_LEVEL,
            prettyPrint: process.env.LOG_PRETTY_PRINT,
        },
    };
    const result = ConfigSchema.safeParse(rawConfig);
    if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        const errorMessages = Object.entries(errors)
            .flatMap(([field, messages]) => messages.map(msg => `${field}: ${msg}`))
            .join('\n');
        throw new Error(`Configuration validation failed:\n${errorMessages}`);
    }
    return result.data;
}
export const config = loadConfig();
//# sourceMappingURL=config.js.map