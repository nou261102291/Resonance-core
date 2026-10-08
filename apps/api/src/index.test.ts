import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createHmac } from 'node:crypto';

process.env.NEBIUS_API_KEY ??= 'test-key';
process.env.TAVILY_API_KEY ??= 'test-key';
process.env.GITHUB_APP_ID = '123';
process.env.GITHUB_PRIVATE_KEY ??= 'test-private-key';
process.env.GITHUB_WEBHOOK_SECRET ??= 'test-webhook-secret';
process.env.VERIFICATION_CALLBACK_SECRET = 'test-verification-secret-with-32-bytes-min';
process.env.NODE_ENV = 'development';

const { processFailure } = vi.hoisted(() => ({
  processFailure: vi.fn().mockResolvedValue({
    success: true,
    githubResult: { action: 'create_pr', branchName: 'resonance/test' },
    durationMs: 1,
  }),
}));
const { recordVerificationResult } = vi.hoisted(() => ({
  recordVerificationResult: vi.fn().mockResolvedValue({ status: 'passed', candidateSha: 'a'.repeat(40) }),
}));

vi.mock('./services/pipeline.js', () => ({
  pipelineOrchestrator: { processFailure },
}));
vi.mock('./services/verification-gate.js', () => ({
  verificationGate: { recordResult: recordVerificationResult },
}));

const { buildServer } = await import('./index.js');
const { generateTestSignature } = await import('./utils/github-webhook.js');
const server = await buildServer();

function createVerificationSignature(payload: string, timestamp: string): string {
  const digest = createHmac('sha256', process.env.VERIFICATION_CALLBACK_SECRET!)
    .update(timestamp)
    .update('.')
    .update(payload)
    .digest('hex');
  return `sha256=${digest}`;
}

afterAll(async () => {
  await server.close();
});

describe('API health routes', () => {
  it('serves liveness without contacting external services', async () => {
    const response = await server.inject({ method: 'GET', url: '/health/live' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ status: 'alive' });
  });

  it('serves dependency readiness from configured test credentials', async () => {
    const response = await server.inject({ method: 'GET', url: '/health/ready' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: 'ready',
      checks: { config: true, nebius: true, tavily: true, github: true },
    });
  });

  it('accepts a correctly signed webhook without invoking external providers', async () => {
    const payload = JSON.stringify({ action: 'created' });
    const response = await server.inject({
      method: 'POST',
      url: '/webhook/github',
      headers: {
        'content-type': 'application/json',
        'x-hub-signature-256': generateTestSignature(payload, 'test-webhook-secret'),
        'x-github-event': 'ping',
        'x-github-delivery': 'test-delivery',
      },
      payload,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ status: 'ignored' });
  });

  it('rejects an invalid webhook signature', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/webhook/github',
      headers: {
        'content-type': 'application/json',
        'x-hub-signature-256': 'sha256=invalid',
        'x-github-event': 'ping',
        'x-github-delivery': 'test-delivery',
      },
      payload: JSON.stringify({ action: 'created' }),
    });

    expect(response.statusCode).toBe(401);
  });

  it('rejects malformed supported webhook payloads before processing', async () => {
    const payload = JSON.stringify({ action: 'completed' });
    const response = await server.inject({
      method: 'POST',
      url: '/webhook/github',
      headers: {
        'content-type': 'application/json',
        'x-hub-signature-256': generateTestSignature(payload, 'test-webhook-secret'),
        'x-github-event': 'workflow_run',
        'x-github-delivery': 'test-delivery',
      },
      payload,
    });

    expect(response.statusCode).toBe(400);
  });

  it('rejects a payload that does not match its declared GitHub event', async () => {
    const payload = JSON.stringify({ action: 'completed', check_run: {} });
    const response = await server.inject({
      method: 'POST',
      url: '/webhook/github',
      headers: {
        'content-type': 'application/json',
        'x-hub-signature-256': generateTestSignature(payload, 'test-webhook-secret'),
        'x-github-event': 'workflow_run',
        'x-github-delivery': 'test-mismatched-event',
      },
      payload,
    });

    expect(response.statusCode).toBe(400);
    expect(processFailure).not.toHaveBeenCalled();
  });

  it('passes validated signed failures to the pipeline with the installation ID', async () => {
    const repository = {
      id: 10,
      name: 'service',
      full_name: 'octo-org/service',
      owner: { login: 'octo-org', id: 1, type: 'Organization' },
      private: true,
    };
    const payload = JSON.stringify({
      action: 'completed',
      workflow_run: {
        id: 21,
        workflow_id: 22,
        name: 'CI',
        head_branch: 'main',
        head_sha: '0123456789abcdef0123456789abcdef01234567',
        conclusion: 'failure',
        status: 'completed',
        repository,
        head_repository: repository,
        created_at: '2026-10-07T00:00:00Z',
        updated_at: '2026-10-07T00:00:00Z',
        run_number: 3,
        run_attempt: 1,
        event: 'push',
        jobs_url: 'https://api.github.com/repos/octo-org/service/actions/runs/21/jobs',
        logs_url: 'https://api.github.com/repos/octo-org/service/actions/runs/21/logs',
        check_suite_url: 'https://api.github.com/repos/octo-org/service/check-suites/21',
        artifacts_url: 'https://api.github.com/repos/octo-org/service/actions/runs/21/artifacts',
      },
      repository,
      sender: { login: 'octo-user', id: 2, type: 'User' },
      installation: { id: 789 },
    });
    const response = await server.inject({
      method: 'POST',
      url: '/webhook/github',
      headers: {
        'content-type': 'application/json',
        'x-hub-signature-256': generateTestSignature(payload, 'test-webhook-secret'),
        'x-github-event': 'workflow_run',
        'x-github-delivery': 'test-failure-delivery',
      },
      payload,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ status: 'completed' });
    expect(processFailure).toHaveBeenCalledWith(
      expect.objectContaining({
        repository: expect.objectContaining({ id: 10, installationId: 789 }),
        workflow: expect.objectContaining({ id: 22 }),
      }),
      789,
    );
  });
});

describe('verification result callback', () => {
  beforeEach(() => {
    recordVerificationResult.mockClear();
  });

  it('rejects unsigned results before they reach the verification gate', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/verification/result',
      headers: { 'content-type': 'application/json' },
      payload: JSON.stringify({ requestId: 'delivery-1' }),
    });

    expect(response.statusCode).toBe(401);
    expect(recordVerificationResult).not.toHaveBeenCalled();
  });

  it('routes authenticated results through the gate and returns the terminal state', async () => {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const payload = JSON.stringify({ requestId: 'delivery-2', result: { outcome: 'passed' } });
    const response = await server.inject({
      method: 'POST',
      url: '/verification/result',
      headers: {
        'content-type': 'application/json',
        'x-resonance-timestamp': timestamp,
        'x-resonance-signature': createVerificationSignature(payload, timestamp),
      },
      payload,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'passed', candidateSha: 'a'.repeat(40) });
    expect(recordVerificationResult).toHaveBeenCalledWith({ requestId: 'delivery-2', result: { outcome: 'passed' } });
  });

  it('rejects stale signed callbacks before reaching the gate', async () => {
    const timestamp = (Math.floor(Date.now() / 1000) - 600).toString();
    const payload = JSON.stringify({ requestId: 'delivery-3' });
    const response = await server.inject({
      method: 'POST',
      url: '/verification/result',
      headers: {
        'content-type': 'application/json',
        'x-resonance-timestamp': timestamp,
        'x-resonance-signature': createVerificationSignature(payload, timestamp),
      },
      payload,
    });

    expect(response.statusCode).toBe(401);
    expect(recordVerificationResult).not.toHaveBeenCalled();
  });

  it('rejects a callback whose body does not match its signature', async () => {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signedPayload = JSON.stringify({ requestId: 'delivery-4' });
    const response = await server.inject({
      method: 'POST',
      url: '/verification/result',
      headers: {
        'content-type': 'application/json',
        'x-resonance-timestamp': timestamp,
        'x-resonance-signature': createVerificationSignature(signedPayload, timestamp),
      },
      payload: JSON.stringify({ requestId: 'tampered' }),
    });

    expect(response.statusCode).toBe(401);
    expect(recordVerificationResult).not.toHaveBeenCalled();
  });
});