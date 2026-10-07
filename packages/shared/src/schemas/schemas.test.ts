import { describe, expect, it } from 'vitest';
import { FailureContextSchema } from './index.js';

describe('FailureContextSchema', () => {
  it('accepts a complete sanitized failure context', () => {
    const parsed = FailureContextSchema.safeParse({
      repository: { owner: 'octo-org', name: 'service', fullName: 'octo-org/service', installationId: 42 },
      workflow: { id: 10, name: 'CI', runNumber: 3, runAttempt: 1 },
      commit: { sha: '0123456789abcdef', branch: 'main' },
      failure: {
        jobName: 'build',
        conclusion: 'failure',
        logsUrl: 'https://example.test/logs',
        errorLog: 'TypeScript compilation failed',
      },
      timestamp: '2026-10-07T00:00:00.000Z',
    });

    expect(parsed.success).toBe(true);
  });

  it('rejects malformed log URLs', () => {
    const parsed = FailureContextSchema.safeParse({
      repository: { owner: 'octo-org', name: 'service', fullName: 'octo-org/service' },
      workflow: { id: 10, name: 'CI', runNumber: 3, runAttempt: 1 },
      commit: { sha: '0123456789abcdef', branch: 'main' },
      failure: { jobName: 'build', conclusion: 'failure', logsUrl: 'not-a-url', errorLog: 'failed' },
      timestamp: '2026-10-07T00:00:00.000Z',
    });

    expect(parsed.success).toBe(false);
  });
});