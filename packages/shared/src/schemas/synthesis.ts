// packages/shared/src/schemas/synthesis.ts
// Zod schemas for Nemotron Ultra synthesis output

import { z } from "zod";

/**
 * Structured output from Nemotron Ultra synthesis step
 */
export const SynthesisOutputSchema = z.object({
  // Root cause explanation (2-3 sentences max)
  root_cause: z.string().min(10).max(1000).describe("Clear explanation of why the failure occurred"),

  // The fix as a unified diff
  patch: z.string().min(1).describe("Unified diff format patch (git diff output)"),

  // Brief explanation of the fix approach
  fix_explanation: z.string().min(10).max(500).describe("What the patch does and why it works"),

  // Confidence in the fix (1-10)
  fix_confidence: z.number().int().min(1).max(10).describe("Confidence that this fix resolves the issue"),

  // Files modified
  files_changed: z.array(z.string()).min(1).describe("List of file paths modified by the patch"),

  // Estimated lines changed
  lines_changed: z.number().int().min(0).describe("Approximate number of lines added/removed"),

  // Token usage for cost tracking
  token_usage: z.object({
    prompt_tokens: z.number().int().min(0),
    completion_tokens: z.number().int().min(0),
    total_tokens: z.number().int().min(0),
  }),

  // Optional: alternative approaches considered
  alternatives_considered: z.array(z.string()).optional(),

  // Optional: warnings or caveats
  warnings: z.array(z.string()).optional(),
});

export type SynthesisOutput = z.infer<typeof SynthesisOutputSchema>;

/**
 * Input to the synthesis step
 */
export const SynthesisInputSchema = z.object({
  triage: z.object({
    error_signature: z.string(),
    affected_file: z.string(),
    library_version: z.string().optional(),
    risk_score: z.number().int().min(1).max(10),
    confidence_score: z.number().int().min(1).max(10),
  }),
  research: z.object({
    snippets: z.array(z.object({
      source: z.string(),
      title: z.string(),
      url: z.string().url(),
      relevant_content: z.string(),
      confidence: z.number().min(0).max(1),
    })),
  }),
  original_file_content: z.string().optional().describe("Content of the affected file before the fix"),
});

export type SynthesisInput = z.infer<typeof SynthesisInputSchema>;