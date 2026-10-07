import { config } from './config.js';
import { createChildLogger } from './logger.js';

const log = createChildLogger({ component: 'sanitizer' });

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
 * Compile sanitization patterns from configuration
 */
function compilePatterns(): SanitizationPattern[] {
  return config.security.logSanitization.patterns.map((p) => ({
    pattern: new RegExp(p.pattern, 'gi'),
    replacement: p.replacement,
  }));
}

const PATTERNS = compilePatterns();

/**
 * Sanitize a string by replacing sensitive patterns
 */
export function sanitizeString(input: string): SanitizationResult {
  if (!config.security.logSanitization.enabled) {
    return {
      sanitized: input,
      redactions: 0,
      patternsMatched: [],
    };
  }

  let sanitized = input;
  let totalRedactions = 0;
  const patternsMatched: string[] = [];

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
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value).sanitized;
    } else if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        sanitized[key] = value.map((v) =>
          typeof v === 'string' ? sanitizeString(v).sanitized : sanitizeObject(v as Record<string, unknown>)
        );
      } else {
        sanitized[key] = sanitizeObject(value as Record<string, unknown>);
      }
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

/**
 * Sanitize GitHub webhook payload specifically
 * Preserves structure while redacting sensitive fields
 */
export function sanitizeWebhookPayload(payload: unknown): unknown {
  if (!payload || typeof payload !== 'object') {
    return payload;
  }

  const sanitized = { ...payload } as Record<string, unknown>;

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

  function sanitizeRecursive(obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      
      // Check if key is sensitive
      const isSensitive = sensitiveKeys.some((sk) => lowerKey.includes(sk));
      
      if (isSensitive && typeof value === 'string') {
        result[key] = '[REDACTED]';
      } else if (typeof value === 'string') {
        result[key] = sanitizeString(value).sanitized;
      } else if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          result[key] = value.map((v) =>
            typeof v === 'object' && v !== null
              ? sanitizeRecursive(v as Record<string, unknown>)
              : typeof v === 'string'
                ? sanitizeString(v).sanitized
                : v
          );
        } else {
          result[key] = sanitizeRecursive(value as Record<string, unknown>);
        }
      } else {
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
export function sanitizeErrorLog(log: string): string {
  return sanitizeString(log).sanitized;
}

/**
 * Create a sanitized audit entry for logging
 */
export function createAuditEntry(
  original: string,
  result: SanitizationResult
): Record<string, unknown> {
  return {
    originalLength: original.length,
    sanitizedLength: result.sanitized.length,
    redactions: result.redactions,
    patternsMatched: result.patternsMatched,
    timestamp: new Date().toISOString(),
  };
}