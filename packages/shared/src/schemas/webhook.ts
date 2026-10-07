// packages/shared/src/schemas/webhook.ts
// Zod schemas for GitHub webhook payloads

import { z } from "zod";

/**
 * GitHub Actions workflow_run webhook payload
 * See: https://docs.github.com/en/webhooks/webhook-events-and-payloads#workflow_run
 */
export const GitHubWorkflowRunPayloadSchema = z.object({
  action: z.literal("completed"),
  workflow_run: z.object({
    id: z.number(),
    workflow_id: z.number(),
    name: z.string(),
    head_branch: z.string(),
    head_sha: z.string(),
    conclusion: z.enum(["success", "failure", "neutral", "cancelled", "skipped", "timed_out", "action_required"]),
    status: z.enum(["completed", "in_progress", "queued", "waiting"]),
    repository: z.object({
      id: z.number(),
      name: z.string(),
      full_name: z.string(),
      owner: z.object({
        login: z.string(),
        id: z.number(),
        type: z.enum(["User", "Organization"]),
      }),
      private: z.boolean(),
    }),
    head_repository: z.object({
      id: z.number(),
      name: z.string(),
      full_name: z.string(),
      owner: z.object({
        login: z.string(),
        id: z.number(),
        type: z.enum(["User", "Organization"]),
      }),
      private: z.boolean(),
    }),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
    run_number: z.number(),
    run_attempt: z.number(),
    event: z.string(),
    jobs_url: z.string().url(),
    logs_url: z.string().url(),
    check_suite_url: z.string().url(),
    artifacts_url: z.string().url(),
  }),
  repository: z.object({
    id: z.number(),
    name: z.string(),
    full_name: z.string(),
    owner: z.object({
      login: z.string(),
      id: z.number(),
      type: z.enum(["User", "Organization"]),
    }),
    private: z.boolean(),
  }),
  sender: z.object({
    login: z.string(),
    id: z.number(),
    type: z.enum(["User", "Bot"]),
  }),
  installation: z.object({ id: z.number() }).passthrough().optional(),
});

export type GitHubWorkflowRunPayload = z.infer<typeof GitHubWorkflowRunPayloadSchema>;

/**
 * GitHub check_run webhook payload (alternative trigger)
 * See: https://docs.github.com/en/webhooks/webhook-events-and-payloads#check_run
 */
export const GitHubCheckRunPayloadSchema = z.object({
  action: z.enum(["completed", "rerequested", "requested_action"]),
  check_run: z.object({
    id: z.number(),
    name: z.string(),
    status: z.enum(["completed", "in_progress", "queued"]),
    conclusion: z.enum(["success", "failure", "neutral", "cancelled", "skipped", "timed_out", "action_required"]).nullable(),
    head_sha: z.string(),
    repository: z.object({
      id: z.number(),
      name: z.string(),
      full_name: z.string(),
      owner: z.object({
        login: z.string(),
        id: z.number(),
        type: z.enum(["User", "Organization"]),
      }),
      private: z.boolean(),
    }),
    details_url: z.string().url().nullable(),
    html_url: z.string().url(),
    external_id: z.string().nullable(),
    output: z.object({
      title: z.string().nullable().optional(),
      summary: z.string().nullable().optional(),
      text: z.string().nullable().optional(),
    }).nullable().optional(),
  }),
  repository: z.object({
    id: z.number(),
    name: z.string(),
    full_name: z.string(),
    owner: z.object({
      login: z.string(),
      id: z.number(),
      type: z.enum(["User", "Organization"]),
    }),
    private: z.boolean(),
  }),
  sender: z.object({
    login: z.string(),
    id: z.number(),
    type: z.enum(["User", "Bot"]),
  }),
  installation: z.object({ id: z.number() }).passthrough().optional(),
});

export type GitHubCheckRunPayload = z.infer<typeof GitHubCheckRunPayloadSchema>;

/**
 * Union of supported webhook payloads
 */
export const GitHubWebhookPayloadSchema = z.union([
  GitHubWorkflowRunPayloadSchema,
  GitHubCheckRunPayloadSchema,
]);

export type GitHubWebhookPayload = z.infer<typeof GitHubWebhookPayloadSchema>;

/**
 * Extracted failure context from webhook
 */
export const FailureContextSchema = z.object({
  repository: z.object({
    owner: z.string(),
    name: z.string(),
    fullName: z.string(),
    installationId: z.number().optional(),
  }),
  workflow: z.object({
    id: z.number(),
    name: z.string(),
    runNumber: z.number(),
    runAttempt: z.number(),
  }),
  commit: z.object({
    sha: z.string(),
    branch: z.string(),
  }),
  failure: z.object({
    jobName: z.string(),
    conclusion: z.string(),
    logsUrl: z.string().url(),
    errorLog: z.string(),
  }),
  timestamp: z.string().datetime(),
});

export type FailureContext = z.infer<typeof FailureContextSchema>;