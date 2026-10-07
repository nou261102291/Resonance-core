import { beforeAll, describe, expect, it } from 'vitest';
import type { AutonomyTier, CostReceipt, FixPackage, TriageOutput } from '@resonance/shared/schemas';

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
  estimated_human_minutes_saved: 5,
};

describe('AutonomyRouter', () => {
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
  });
});