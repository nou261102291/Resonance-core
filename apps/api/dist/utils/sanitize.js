import { config } from './config.js';
import { createChildLogger } from './logger.js';
const log = createChildLogger({ component: 'sanitizer' });
/**
 * Compile sanitization patterns from configuration
 */
function compilePatterns() {
    return config.security.logSanitization.patterns.map((p) => ({
        pattern: new RegExp(p.pattern, 'gi'),
        replacement: p.replacement,
    }));
}
const PATTERNS = compilePatterns();
/**
 * Sanitize a string by replacing sensitive patterns
 */
export function sanitizeString(input) {
    if (!config.security.logSanitization.enabled) {
        return {
            sanitized: input,
            redactions: 0,
            patternsMatched: [],
        };
    }
    let sanitized = input;
    let totalRedactions = 0;
    const patternsMatched = [];
    for (const { pattern, replacement } of PATTERNS) {
        const matches = sanitized.match(pattern);
        if (matches) {
            totalRedactions += matches.length;
            patternsMatched.push(pattern.source);
            sanitized = sanitized.replace(pattern, replacement);
        }
    }
    if (totalRedactions > 0) {
        log.debug({ redactions: totalRedactions, patternsMatched }, 'Sanitized sensitive data');
    }
    return {
        sanitized,
        redactions: totalRedactions,
        patternsMatched,
    };
}
/**
 * Sanitize an object recursively, returning a new sanitized object
 */
export function sanitizeObject(obj) {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[key] = sanitizeString(value).sanitized;
        }
        else if (typeof value === 'object' && value !== null) {
            if (Array.isArray(value)) {
                sanitized[key] = value.map((v) => typeof v === 'string' ? sanitizeString(v).sanitized : sanitizeObject(v));
            }
            else {
                sanitized[key] = sanitizeObject(value);
            }
        }
        else {
            sanitized[key] = value;
        }
    }
    return sanitized;
}
/**
 * Sanitize GitHub webhook payload specifically
 * Preserves structure while redacting sensitive fields
 */
export function sanitizeWebhookPayload(payload) {
    if (!payload || typeof payload !== 'object') {
        return payload;
    }
    const sanitized = { ...payload };
    // Fields that commonly contain sensitive data
    const sensitiveKeys = [
        'token',
        'access_token',
        'refresh_token',
        'client_secret',
        'private_key',
        'secret',
        'password',
        'authorization',
        'cookie',
        'set-cookie',
    ];
    function sanitizeRecursive(obj) {
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            const lowerKey = key.toLowerCase();
            // Check if key is sensitive
            const isSensitive = sensitiveKeys.some((sk) => lowerKey.includes(sk));
            if (isSensitive && typeof value === 'string') {
                result[key] = '[REDACTED]';
            }
            else if (typeof value === 'string') {
                result[key] = sanitizeString(value).sanitized;
            }
            else if (typeof value === 'object' && value !== null) {
                if (Array.isArray(value)) {
                    result[key] = value.map((v) => typeof v === 'object' && v !== null
                        ? sanitizeRecursive(v)
                        : typeof v === 'string'
                            ? sanitizeString(v).sanitized
                            : v);
                }
                else {
                    result[key] = sanitizeRecursive(value);
                }
            }
            else {
                result[key] = value;
            }
        }
        return result;
    }
    return sanitizeRecursive(sanitized);
}
/**
 * Sanitize error log for LLM consumption
 * Removes secrets but preserves error structure
 */
export function sanitizeErrorLog(log) {
    return sanitizeString(log).sanitized;
}
/**
 * Create a sanitized audit entry for logging
 */
export function createAuditEntry(original, result) {
    return {
        originalLength: original.length,
        sanitizedLength: result.sanitized.length,
        redactions: result.redactions,
        patternsMatched: result.patternsMatched,
        timestamp: new Date().toISOString(),
    };
}
//# sourceMappingURL=sanitize.js.map