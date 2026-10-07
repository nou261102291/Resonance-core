import { describe, expect, it } from 'vitest';

process.env.NEBIUS_API_KEY ??= 'test-key';
process.env.TAVILY_API_KEY ??= 'test-key';
process.env.GITHUB_APP_ID ??= 'test-app';
process.env.GITHUB_PRIVATE_KEY ??= 'test-private-key';
process.env.GITHUB_WEBHOOK_SECRET ??= 'test-webhook-secret';
process.env.NODE_ENV = 'development';

const { sanitizeString, sanitizeWebhookPayload } = await import('./sanitize.js');

describe('log sanitization', () => {
  it('redacts bearer credentials while retaining surrounding diagnostic text', () => {
    const result = sanitizeString('request failed: Bearer abc_def-123; retry later');

    expect(result.sanitized).toContain('[BEARER_TOKEN_REDACTED]');
    expect(result.sanitized).toContain('request failed:');
    expect(result.sanitized).toContain('retry later');
    expect(result.redactions).toBeGreaterThan(0);
  });

  it('redacts secret-valued webhook fields recursively without mutating input', () => {
    const payload = {
      repository: { name: 'service' },
      installation: { access_token: 'never-log-this' },
      workflow_run: { logs_url: 'https://example.test/logs' },
    };

    const sanitized = sanitizeWebhookPayload(payload) as typeof payload;

    expect(sanitized.installation.access_token).toBe('[REDACTED]');
    expect(sanitized.workflow_run.logs_url).toBe('https://example.test/logs');
    expect(payload.installation.access_token).toBe('never-log-this');
  });
});