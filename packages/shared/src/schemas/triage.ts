// packages/shared/src/schemas/triage.ts
// Zod schemas for Nemotron Nano triage output

import { z } from "zod";

/**
 * Structured output from Nemotron Nano triage step
 * This is the critical routing decision point
 */
export const TriageOutputSchema = z.object({
  // Core error identification
  error_signature: z.string().min(1).max(500).describe("Concise error signature, e.g., 'TypeError: Cannot read properties of undefined'"),
  affected_file: z.string().min(1).max(500)
    .refine((path) => {
      const normalizedPath = path.replace(/\\/g, '/');
      return !path.includes('\0') &&
        !normalizedPath.startsWith('/') &&
        !/^[a-z]:/i.test(path) &&
        !normalizedPath.split('/').includes('..');
    }, 'Affected file must be a relative repository path without traversal segments')
    .describe("Relative path to the file containing the error"),
  library_version: z.string().max(200).optional().describe("Library name and version if identifiable, e.g., 'next-auth@4.22.1'"),

  // Risk assessment (1-10 scale)
  risk_score: z.number().int().min(1).max(10).describe("Risk level: 1=trivial, 10=critical production risk"),
  confidence_score: z.number().int().min(1).max(10).describe("Confidence in assessment: 1=guessing, 10=certain"),

  // Change scope estimation
  change_scope_estimate: z.enum(["trivial", "minor", "moderate", "major"]).describe("Estimated lines of code to fix"),

  // Routing decision
  recommended_tier: z.enum(["Tier 1: Guardian", "Tier 2: Co-Pilot", "Tier 3: Autopilot"]).describe("Autonomy tier recommendation"),

  // Research query for Tavily
  tavily_query: z.string().min(1).max(1000).describe("Optimized search query for Tavily API"),

  // Optional metadata
  error_type: z.enum(["type_error", "reference_error", "syntax_error", "build_error", "test_failure", "dependency_error", "config_error", "unknown"]).optional(),
  suggested_fix_category: z.enum(["optional_chaining", "type_annotation", "import_fix", "version_bump", "config_change", "test_update", "migration", "refactor", "other"]).optional(),
  reasoning: z.string().max(1000).optional().describe("Brief reasoning for the risk/confidence scores"),
});

export type TriageOutput = z.infer<typeof TriageOutputSchema>;

/**
 * Input to the triage step (sanitized failure context)
 */
export const TriageInputSchema = z.object({
  error_log: z.string().min(1).max(50000),
  repository_context: z.object({
    primary_language: z.string().max(100).optional(),
    package_json: z.string().max(20000).optional(),
    tsconfig: z.string().max(20000).optional(),
  }).optional(),
});

export type TriageInput = z.infer<typeof TriageInputSchema>;