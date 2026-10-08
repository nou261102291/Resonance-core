import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AutonomyTier, CostReceipt, FixPackage, TriageOutput } from '@resonance/shared/schemas';

const githubMocks = vi.hoisted(() => ({
  getInstallationOctokit: vi.fn(),
  getDefaultBranch: vi.fn(),
  getBranchHeadSha: vi.fn(),
  getCommitTreeSha: vi.fn(),
  createBranch: vi.fn(),
  createTree: vi.fn(),
  createCommit: vi.fn(),
  updateRef: vi.fn(),
  createPullRequest: vi.fn(),
  createCommitStatus: vi.fn(),
  closePullRequest: vi.fn(),
  getFileContent: vi.fn(),
  branchExists: vi.fn(),
}));

vi.mock('./github-client.js', () => ({ githubClient: githubMocks }));

process.env.NEBIUS_API_KEY ??= 'test-key';
process.env.TAVILY_API_KEY ??= 'test-key';
process.env.GITHUB_APP_ID = '123';
process.env.GITHUB_PRIVATE_KEY ??= 'test-private-key';
process.env.GITHUB_WEBHOOK_SECRET ??= 'test-webhook-secret';
process.env.NODE_ENV = 'development';

let AutonomyRouter: typeof import('./autonomy-router.js').AutonomyRouter;

beforeAll(async () => {
  ({ AutonomyRouter } = await import('./autonomy-router.js'));
});

const triage = (overrides: Partial<TriageOutput> = {}): TriageOutput => ({
  error_signature: 'TypeError: missing value',
  affected_file: 'src/service.ts',
  risk_score: 5,
  confidence_score: 7,
  change_scope_estimate: 'minor',
  recommended_tier: 'Tier 2: Co-Pilot',
  tavily_query: 'TypeError missing value',
  ...overrides,
});

const receipt: CostReceipt = {
  triage: { model: 'nano', prompt_tokens: 10, completion_tokens: 5, cost_usd: 0.000002 },
  synthesis: { model: 'ultra', prompt_tokens: 20, completion_tokens: 10, cost_usd: 0.000015 },
  total_cost_usd: 0.000017,
};

describe('AutonomyRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    githubMocks.getInstallationOctokit.mockResolvedValue({});
    githubMocks.getDefaultBranch.mockResolvedValue('main');
    githubMocks.getBranchHeadSha.mockResolvedValue('1'.repeat(40));
    githubMocks.getCommitTreeSha.mockResolvedValue('2'.repeat(40));
    githubMocks.createTree.mockResolvedValue('3'.repeat(40));
    githubMocks.createCommit.mockResolvedValue('4'.repeat(40));
    githubMocks.getFileContent.mockResolvedValue('const value = 1;\n');
    githubMocks.createPullRequest.mockResolvedValue({ number: 42, html_url: 'https://github.com/octo-org/service/pull/42' });
    githubMocks.branchExists.mockResolvedValue(false);
  });

  it('forces protected nested paths into Guardian regardless of scores', () => {
    const router = new AutonomyRouter();

    expect(router.determineTier(triage({
      affected_file: 'src/auth/session.ts',
      risk_score: 1,
      confidence_score: 10,
      change_scope_estimate: 'trivial',
    }))).toBe('Tier 1: Guardian');
  });

  it('allows a low-risk nested test change to use Autopilot', () => {
    const router = new AutonomyRouter();

    expect(router.determineTier(triage({
      affected_file: 'packages/core/src/example.test.ts',
      risk_score: 2,
      confidence_score: 9,
      change_scope_estimate: 'trivial',
    }))).toBe('Tier 3: Autopilot');
  });

  it('keeps low-risk changes outside the allowlist in Co-Pilot', () => {
    const router = new AutonomyRouter();

    expect(router.determineTier(triage({
      affected_file: 'src/services/handler.ts',
      risk_score: 2,
      confidence_score: 10,
      change_scope_estimate: 'trivial',
    }))).toBe('Tier 2: Co-Pilot');
  });

  it('routes moderate risk to Co-Pilot and requires review', () => {
    const router = new AutonomyRouter();
    const tier: AutonomyTier = router.determineTier(triage());
    const decision = router.buildDecision(triage(), tier);

    expect(decision.tier).toBe('Tier 2: Co-Pilot');
    expect(decision.action).toBe('create_pr');
    expect(decision.requires_human_review).toBe(true);
  });

  it('calculates a rounded model-cost receipt from prompt and completion usage', () => {
    const router = new AutonomyRouter();

    expect(router.calculateCostReceipt(
      { prompt_tokens: 100, completion_tokens: 40, total_tokens: 140 },
      { prompt_tokens: 400, completion_tokens: 120, total_tokens: 520 },
    )).toEqual({
      triage: { model: 'nvidia/nemotron-nano', prompt_tokens: 100, completion_tokens: 40, cost_usd: 0.000014 },
      synthesis: { model: 'nvidia/nemotron-3-ultra', prompt_tokens: 400, completion_tokens: 120, cost_usd: 0.00026 },
      total_cost_usd: 0.000274,
    });
  });

  it('opens a Tier 3 PR against the default branch and leaves validation pending', async () => {
    const router = new AutonomyRouter();
    const source = triage({
      affected_file: 'packages/core/src/example.test.ts',
      risk_score: 2,
      confidence_score: 9,
      change_scope_estimate: 'trivial',
    });
    const tier = router.determineTier(source);
    const decision = router.buildDecision(source, tier);
    expect(decision.requires_human_review).toBe(true);
    expect(decision.labels).toContain('validation-required');
    const fixPackage: FixPackage = {
      repository: { owner: 'octo-org', name: 'service' },
      commit: { sha: '0123456789abcdef0123456789abcdef01234567' },
      triage: source,
      synthesis: {
        root_cause: 'A missing value causes the test to fail.',
        patch: 'diff --git a/packages/core/src/example.test.ts b/packages/core/src/example.test.ts\n--- a/packages/core/src/example.test.ts\n+++ b/packages/core/src/example.test.ts\n@@ -1 +1 @@\n-const value = 1;\n+const value = 2;',
        fix_explanation: 'Adds a checked fallback for the test value.',
        fix_confidence: 9,
        files_changed: ['packages/core/src/example.test.ts'],
        lines_changed: 1,
        token_usage: { prompt_tokens: 20, completion_tokens: 10, total_tokens: 30 },
      },
      autonomy_decision: router.buildDecision(source, tier),
      cost_receipt: receipt,
      timestamp: new Date().toISOString(),
    };

    const result = await router.executeFix(fixPackage, 789, 123);

    expect(result.prNumber).toBe(42);
    expect(result.candidateSha).toBe('4'.repeat(40));
    expect(githubMocks.getInstallationOctokit).toHaveBeenCalledWith(789, 123);
    expect(githubMocks.createTree).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ base_tree: '2'.repeat(40) }));
    expect(githubMocks.createTree).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      tree: [expect.objectContaining({ path: 'packages/core/src/example.test.ts', content: 'const value = 2;\n' })],
    }));
    expect(githubMocks.createPullRequest).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ base_branch: 'main', draft: false }));
    expect(githubMocks.createCommitStatus).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      sha: '4'.repeat(40),
      state: 'pending',
      context: 'resonance/patch-validation',
    }));

    githubMocks.createCommitStatus.mockRejectedValueOnce(new Error('Status API unavailable'));
    await expect(router.executeFix(fixPackage, 789, 123)).rejects.toThrow('Status API unavailable');
    expect(githubMocks.closePullRequest).toHaveBeenCalledWith(expect.anything(), 'octo-org', 'service', 42);
  });

  it('does not create a branch when the patch cannot apply to the base file', async () => {
    const router = new AutonomyRouter();
    const source = triage({
      affected_file: 'packages/core/src/example.test.ts',
      risk_score: 2,
      confidence_score: 9,
      change_scope_estimate: 'trivial',
    });
    const tier = router.determineTier(source);
    const fixPackage: FixPackage = {
      repository: { owner: 'octo-org', name: 'service' },
      commit: { sha: '0123456789abcdef0123456789abcdef01234567' },
      triage: source,
      synthesis: {
        root_cause: 'The patch does not match the current source file.',
        patch: 'diff --git a/packages/core/src/example.test.ts b/packages/core/src/example.test.ts\n--- a/packages/core/src/example.test.ts\n+++ b/packages/core/src/example.test.ts\n@@ -1 +1 @@\n-not the current value\n+replacement',
        fix_explanation: 'Attempts to replace a stale source line.',
        fix_confidence: 9,
        files_changed: ['packages/core/src/example.test.ts'],
        lines_changed: 2,
        token_usage: { prompt_tokens: 20, completion_tokens: 10, total_tokens: 30 },
      },
      autonomy_decision: router.buildDecision(source, tier),
      cost_receipt: receipt,
      timestamp: new Date().toISOString(),
    };

    await expect(router.executeFix(fixPackage, 789, 123)).rejects.toThrow('could not be applied');
    expect(githubMocks.createBranch).not.toHaveBeenCalled();
  });

  it('rejects an action that does not match the autonomy tier before GitHub writes', async () => {
    const router = new AutonomyRouter();
    const source = triage();
    const fixPackage: FixPackage = {
      repository: { owner: 'octo-org', name: 'service' },
      commit: { sha: '0123456789abcdef0123456789abcdef01234567' },
      triage: source,
      synthesis: {
        root_cause: 'A missing value causes the build to fail.',
        patch: 'diff --git a/src/service.ts b/src/service.ts',
        fix_explanation: 'Adds a checked fallback for the missing value.',
        fix_confidence: 7,
        files_changed: ['src/service.ts'],
        lines_changed: 1,
        token_usage: { prompt_tokens: 20, completion_tokens: 10, total_tokens: 30 },
      },
      autonomy_decision: { ...router.buildDecision(source, 'Tier 2: Co-Pilot'), action: 'auto_merge' },
      cost_receipt: receipt,
      timestamp: new Date().toISOString(),
    };

    await expect(router.executeFix(fixPackage, 789, 123)).rejects.toThrow('not permitted');
    expect(githubMocks.getInstallationOctokit).not.toHaveBeenCalled();
  });

  it('includes synthesis details and cost receipt in the PR body', () => {
    const router = new AutonomyRouter();
    const source = triage();
    const tier = router.determineTier(source);
    const fixPackage: FixPackage = {
      repository: { owner: 'octo-org', name: 'service' },
      commit: { sha: '0123456789abcdef0123456789abcdef01234567' },
      triage: source,
      synthesis: {
        root_cause: 'The missing value caused the workflow to fail.',
        patch: 'diff --git a/src/service.ts b/src/service.ts',
        fix_explanation: 'Adds a checked fallback for the missing value.',
        fix_confidence: 8,
        files_changed: ['src/service.ts'],
        lines_changed: 2,
        token_usage: { prompt_tokens: 20, completion_tokens: 10, total_tokens: 30 },
        warnings: ['Review downstream callers.'],
      },
      autonomy_decision: router.buildDecision(source, tier),
      cost_receipt: receipt,
      timestamp: new Date().toISOString(),
    };

    const body = router.generatePRBody(fixPackage, fixPackage.autonomy_decision, receipt);

    expect(body).toContain('Review downstream callers.');
    expect(body).toContain('$0.000017');
    expect(body).toContain('src/service.ts');
    expect(body).toContain('Human review required');
    expect(body).toContain('Tavily search charges are excluded');
    expect(body).not.toContain('Human Time Saved');
  });
});