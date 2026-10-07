// packages/shared/src/schemas/synthesis.ts
// Zod schemas for Nemotron Ultra synthesis output

import { z } from "zod";
import { TriageOutputSchema } from "./triage.js";

const RepositoryFilePathSchema = z.string().min(1).max(500).refine((path) => {
  const normalizedPath = path.replace(/\\/g, "/");
  return !path.includes("\0") &&
    !normalizedPath.startsWith("/") &&
    !/^[a-z]:/i.test(path) &&
    !normalizedPath.split("/").includes("..");
}, "File path must be relative to the repository");

const UnifiedDiffSchema = z.string().min(1).max(50000).refine((patch) => {
  const fileHeaders = [...patch.matchAll(/^diff --git a\/(.+?) b\/(.+)$/gm)];
  const header = fileHeaders[0];
  const oldFile = header?.[1];
  const newFile = header?.[2];
  return fileHeaders.length === 1 &&
    typeof oldFile === 'string' &&
    oldFile === newFile &&
    patch.includes(`--- a/${oldFile}`) &&
    patch.includes(`+++ b/${newFile}`) &&
    /^@@ /m.test(patch);
}, "Patch must be a single-file unified diff with a hunk");

export const SynthesisModelOutputSchema = z.object({
  root_cause: z.string().min(10).max(1000),
  patch: UnifiedDiffSchema,
  fix_explanation: z.string().min(10).max(500),
  fix_confidence: z.number().int().min(1).max(10),
  alternatives_considered: z.array(z.string().max(500)).max(5).optional(),
  warnings: z.array(z.string().max(500)).max(10).optional(),
}).strict();

export const SynthesisInputSchema = z.object({
  error_log: z.string().min(1).max(50000),
  triage: TriageOutputSchema.pick({
    error_signature: true,
    affected_file: true,
    library_version: true,
    risk_score: true,
    confidence_score: true,
    change_scope_estimate: true,
  }),
  research: z.object({
    snippets: z.array(z.object({
      source: z.string().max(200),
      title: z.string().max(500),
      url: z.string().url(),
      relevant_content: z.string().max(5000),
      confidence: z.number().min(0).max(1),
    })).min(1).max(5),
  }),
  original_file_content: z.string().max(50000).optional(),
});

export type SynthesisInput = z.infer<typeof SynthesisInputSchema>;

/**
 * Structured output from Nemotron Ultra synthesis step
 */
export const SynthesisOutputSchema = SynthesisModelOutputSchema.extend({
  // Root cause explanation (2-3 sentences max)
  // Files modified
  files_changed: z.array(RepositoryFilePathSchema).length(1).describe("Single repository-relative file modified by the patch"),

  // Estimated lines changed
  lines_changed: z.number().int().min(1).describe("Number of added and removed patch lines"),

  // Token usage for cost tracking
  token_usage: z.object({
    prompt_tokens: z.number().int().min(0),
    completion_tokens: z.number().int().min(0),
    total_tokens: z.number().int().min(0),
  }),

});

export type SynthesisOutput = z.infer<typeof SynthesisOutputSchema>;