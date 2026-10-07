export interface SanitizationPattern {
    pattern: RegExp;
    replacement: string;
}
export interface SanitizationResult {
    sanitized: string;
    redactions: number;
    patternsMatched: string[];
}
/**
 * Sanitize a string by replacing sensitive patterns
 */
export declare function sanitizeString(input: string): SanitizationResult;
/**
 * Sanitize an object recursively, returning a new sanitized object
 */
export declare function sanitizeObject<T extends Record<string, unknown>>(obj: T): T;
/**
 * Sanitize GitHub webhook payload specifically
 * Preserves structure while redacting sensitive fields
 */
export declare function sanitizeWebhookPayload(payload: unknown): unknown;
/**
 * Sanitize error log for LLM consumption
 * Removes secrets but preserves error structure
 */
export declare function sanitizeErrorLog(log: string): string;
/**
 * Create a sanitized audit entry for logging
 */
export declare function createAuditEntry(original: string, result: SanitizationResult): Record<string, unknown>;
//# sourceMappingURL=sanitize.d.ts.map