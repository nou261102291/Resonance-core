import { beforeEach, describe, expect, it, vi } from 'vitest';

const githubMocks = vi.hoisted(() => ({
  getInstallationOctokit: vi.fn(),
  getPullRequestSnapshot: vi.fn(),
  getCommitStatusState: vi.fn(),
  createCommitStatus: vi.fn(),
  closePullRequest: vi.fn(),
}));

vi.mock('./github-client.js', () => ({ githubClient: githubMocks }));

process.env.NEBIUS_API_KEY ??= 'test-key';
process.env.TAVILY_API_KEY ??= 'test-key';
process.env.GITHUB_APP_ID = '123';
process.env.GITHUB_PRIVATE_KEY ??= 'test-private-key';
process.env.GITHUB_WEBHOOK_SECRET ??= 'test-webhook-secret';
process.env.NODE_ENV = 'development';

const { VerificationGate } = await import('./verification-gate.js');

const candidateSha = 'a'.repeat(40);
const request = (result: unknown) => ({
  requestId: 'request-123',
  installationId: 789,
  repositoryId: 123,
  owner: 'octo-org',
  repo: 'service',
  pullNumber: 42,
  result,
});

const passingResult = {
  job_id: 'job-1',
  candidate_sha: candidateSha,
  outcome: 'passed',
  original_failure_resolved: true,
  checks: [{ name: 'unit-tests', outcome: 'passed', duration_ms: 1250 }],
};

describe('VerificationGate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    githubMocks.getInstallationOctokit.mockResolvedValue({});
    githubMocks.getPullRequestSnapshot.mockResolvedValue({ headSha: candidateSha, state: 'open' });
    githubMocks.getCommitStatusState.mockResolvedValue('pending');
  });

  it('marks only the exact candidate commit successful when every check passes', async () => {
    const gate = new VerificationGate();

    const outcome = await gate.recordResult(request(passingResult));

    expect(outcome).toEqual({ status: 'passed', candidateSha });
    expect(githubMocks.getInstallationOctokit).toHaveBeenCalledWith(789, 123);
    expect(githubMocks.createCommitStatus).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      sha: candidateSha,
      state: 'success',
      context: 'resonance/patch-validation',
    }));
    expect(githubMocks.closePullRequest).not.toHaveBeenCalled();
  });

  it('fails and closes the PR if any required check fails', async () => {
    const gate = new VerificationGate();
    const failedResult = {
      ...passingResult,
      outcome: 'failed',
      original_failure_resolved: false,
      checks: [{ name: 'unit-tests', outcome: 'failed', duration_ms: 1250 }],
    };

    const outcome = await gate.recordResult(request(failedResult));

    expect(outcome.status).toBe('failed');
    expect(githubMocks.createCommitStatus).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ state: 'failure' }));
    expect(githubMocks.closePullRequest).toHaveBeenCalledWith(expect.anything(), 'octo-org', 'service', 42);
  });

  it.each(['cancelled', 'timed_out'] as const)('fails closed when verification is %s', async (outcome) => {
    const gate = new VerificationGate();
    const incompleteResult = {
      ...passingResult,
      outcome,
      original_failure_resolved: false,
    };

    const result = await gate.recordResult(request(incompleteResult));

    expect(result.status).toBe('failed');
    expect(githubMocks.createCommitStatus).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      state: outcome === 'timed_out' ? 'error' : 'failure',
    }));
    expect(githubMocks.closePullRequest).toHaveBeenCalled();
  });

  it('ignores a result for a candidate that is no longer the PR head', async () => {
    const gate = new VerificationGate();
    githubMocks.getPullRequestSnapshot.mockResolvedValue({ headSha: 'b'.repeat(40), state: 'open' });

    const outcome = await gate.recordResult(request(passingResult));

    expect(outcome.status).toBe('stale');
    expect(githubMocks.createCommitStatus).not.toHaveBeenCalled();
    expect(githubMocks.closePullRequest).not.toHaveBeenCalled();
  });

  it('ignores a replayed success report after the PR is already closed', async () => {
    const gate = new VerificationGate();
    githubMocks.getPullRequestSnapshot.mockResolvedValue({ headSha: candidateSha, state: 'closed' });

    const outcome = await gate.recordResult(request(passingResult));

    expect(outcome.status).toBe('stale');
    expect(githubMocks.createCommitStatus).not.toHaveBeenCalled();
    expect(githubMocks.closePullRequest).not.toHaveBeenCalled();
  });

  it('ignores duplicate or conflicting results after the candidate leaves pending', async () => {
    const gate = new VerificationGate();
    githubMocks.getCommitStatusState.mockResolvedValue('success');

    const outcome = await gate.recordResult(request(passingResult));

    expect(outcome.status).toBe('stale');
    expect(githubMocks.createCommitStatus).not.toHaveBeenCalled();
    expect(githubMocks.closePullRequest).not.toHaveBeenCalled();
  });

  it('rejects malformed reports and reports that claim success with failed checks', async () => {
    const gate = new VerificationGate();

    await expect(gate.recordResult(request({ ...passingResult, candidate_sha: 'not-a-sha' })))
      .rejects.toThrow('Verification result failed schema validation');
    await expect(gate.recordResult(request({
      ...passingResult,
      checks: [{ name: 'unit-tests', outcome: 'failed', duration_ms: 1 }],
    }))).rejects.toThrow('Verification result failed schema validation');
    expect(githubMocks.getInstallationOctokit).not.toHaveBeenCalled();
  });

  it('rejects invalid request envelopes before contacting GitHub', async () => {
    const gate = new VerificationGate();

    await expect(gate.recordResult({ ...request(passingResult), repositoryId: 0 }))
      .rejects.toThrow('Verification request failed schema validation');
    await expect(gate.recordResult({ ...request(passingResult), unexpected: true }))
      .rejects.toThrow('Verification request failed schema validation');
    expect(githubMocks.getInstallationOctokit).not.toHaveBeenCalled();
  });

  it('closes a failed candidate even when publishing its failure status errors', async () => {
    const gate = new VerificationGate();
    githubMocks.createCommitStatus.mockRejectedValueOnce(new Error('GitHub status unavailable'));
    const failedResult = {
      ...passingResult,
      outcome: 'failed',
      original_failure_resolved: false,
      checks: [{ name: 'unit-tests', outcome: 'failed', duration_ms: 1250 }],
    };

    await expect(gate.recordResult(request(failedResult)))
      .rejects.toThrow('Verification failed and rollback handling was incomplete');
    expect(githubMocks.closePullRequest).toHaveBeenCalledWith(expect.anything(), 'octo-org', 'service', 42);
  });

  it('publishes the failure status even when PR closure fails', async () => {
    const gate = new VerificationGate();
    githubMocks.closePullRequest.mockRejectedValueOnce(new Error('GitHub PR update unavailable'));
    const failedResult = {
      ...passingResult,
      outcome: 'failed',
      original_failure_resolved: false,
      checks: [{ name: 'unit-tests', outcome: 'failed', duration_ms: 1250 }],
    };

    await expect(gate.recordResult(request(failedResult)))
      .rejects.toThrow('Verification failed and rollback handling was incomplete');
    expect(githubMocks.createCommitStatus).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ state: 'failure' }));
    expect(githubMocks.closePullRequest).toHaveBeenCalled();
  });
});