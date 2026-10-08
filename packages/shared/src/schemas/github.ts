// packages/shared/src/schemas/github.ts
// Zod schemas for GitHub integration and PR actions

import { z } from "zod";
import { TriageOutputSchema } from "./triage.js";
import { SynthesisOutputSchema } from "./synthesis.js";

/**
 * Autonomy tier enum
 */
export const AutonomyTierSchema = z.enum(["Tier 1: Guardian", "Tier 2: Co-Pilot", "Tier 3: Autopilot"]);
export type AutonomyTier = z.infer<typeof AutonomyTierSchema>;

/**
 * Cost receipt for PR body
 */
export const CostReceiptSchema = z.object({
  triage: z.object({
    model: z.string(),
    prompt_tokens: z.number().int().min(0),
    completion_tokens: z.number().int().min(0),
    cost_usd: z.number().min(0),
  }),
  synthesis: z.object({
    model: z.string(),
    prompt_tokens: z.number().int().min(0),
    completion_tokens: z.number().int().min(0),
    cost_usd: z.number().min(0),
  }),
  total_cost_usd: z.number().min(0),
});

export type CostReceipt = z.infer<typeof CostReceiptSchema>;

export const VerificationResultSchema = z.object({
  job_id: z.string().min(1).max(128),
  candidate_sha: z.string().regex(/^[a-f0-9]{40}$/i),
  outcome: z.enum(['passed', 'failed', 'cancelled', 'timed_out']),
  original_failure_resolved: z.boolean(),
  checks: z.array(z.object({
    name: z.string().min(1).max(128),
    outcome: z.enum(['passed', 'failed', 'skipped']),
    duration_ms: z.number().int().min(0).max(86_400_000),
  }).strict()).min(1).max(100),
}).strict().superRefine((result, context) => {
  if (result.outcome === 'passed' && !result.original_failure_resolved) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'Passing verification must resolve the original failure' });
  }
  if (result.outcome === 'passed' && result.checks.some((check) => check.outcome !== 'passed')) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'Passing verification requires every check to pass' });
  }
});

export type VerificationResult = z.infer<typeof VerificationResultSchema>;

/**
 * PR creation input
 */
export const CreatePROptionsSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  base_branch: z.string().default("main"),
  head_branch: z.string(),
  title: z.string().min(1).max(200),
  body: z.string(),
  draft: z.boolean().default(false),
  labels: z.array(z.string()).optional(),
  assignees: z.array(z.string()).optional(),
});

export type CreatePROptions = z.infer<typeof CreatePROptionsSchema>;

/**
 * PR creation result
 */
export const PRResultSchema = z.object({
  number: z.number().int().positive(),
  url: z.string().url(),
  html_url: z.string().url(),
  state: z.enum(["open", "closed", "merged"]),
  draft: z.boolean(),
  head_branch: z.string(),
  base_branch: z.string(),
});

export type PRResult = z.infer<typeof PRResultSchema>;

/**
 * Branch creation options
 */
export const CreateBranchOptionsSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  branch_name: z.string().min(1).max(200),
  base_sha: z.string().length(40),
});

export type CreateBranchOptions = z.infer<typeof CreateBranchOptionsSchema>;

/**
 * Commit creation options
 */
export const CreateCommitOptionsSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  branch: z.string(),
  message: z.string().min(1).max(500),
  tree_sha: z.string().length(40),
  parents: z.array(z.string().length(40)).min(1),
  author: z.object({
    name: z.string(),
    email: z.string().email(),
  }).optional(),
});

export type CreateCommitOptions = z.infer<typeof CreateCommitOptionsSchema>;

/**
 * Tree creation for commit
 */
export const TreeItemSchema = z.object({
  path: z.string(),
  mode: z.enum(["100644", "100755", "040000", "160000", "120000"]).default("100644"),
  type: z.enum(["blob", "tree", "commit"]).default("blob"),
  content: z.string().optional(),
  sha: z.string().length(40).optional(),
});

export type TreeItem = z.infer<typeof TreeItemSchema>;

export const CreateTreeOptionsSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  tree: z.array(TreeItemSchema).min(1),
  base_tree: z.string().length(40).optional(),
});

export type CreateTreeOptions = z.infer<typeof CreateTreeOptionsSchema>;

/**
 * GitHub App installation token
 */
export const InstallationTokenSchema = z.object({
  token: z.string(),
  expires_at: z.string().datetime(),
  repository_selection: z.enum(["all", "selected"]),
  permissions: z.record(z.string()),
});

export type InstallationToken = z.infer<typeof InstallationTokenSchema>;

/**
 * GitHub App configuration
 */
export const GitHubAppConfigSchema = z.object({
  app_id: z.string(),
  private_key: z.string(),
  webhook_secret: z.string(),
  client_id: z.string().optional(),
  client_secret: z.string().optional(),
});

export type GitHubAppConfig = z.infer<typeof GitHubAppConfigSchema>;

/**
 * Autonomy routing decision
 */
export const AutonomyDecisionSchema = z.object({
  tier: AutonomyTierSchema,
  reasoning: z.string(),
  risk_score: z.number().int().min(1).max(10),
  confidence_score: z.number().int().min(1).max(10),
  action: z.enum(["create_draft_pr", "create_pr", "push_to_dev", "auto_merge"]),
  requires_human_review: z.boolean(),
  labels: z.array(z.string()).optional(),
});

export type AutonomyDecision = z.infer<typeof AutonomyDecisionSchema>;

/**
 * Complete fix package ready for Git action
 */
export const FixPackageSchema = z.object({
  repository: z.object({
    owner: z.string(),
    name: z.string(),
  }),
  commit: z.object({
    sha: z.string().min(1),
  }),
  triage: TriageOutputSchema,
  synthesis: SynthesisOutputSchema,
  autonomy_decision: AutonomyDecisionSchema,
  cost_receipt: CostReceiptSchema,
  timestamp: z.string().datetime(),
});

export type FixPackage = z.infer<typeof FixPackageSchema>;