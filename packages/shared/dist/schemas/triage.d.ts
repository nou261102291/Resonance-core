import { z } from "zod";
/**
 * Structured output from Nemotron Nano triage step
 * This is the critical routing decision point
 */
export declare const TriageOutputSchema: z.ZodObject<{
    error_signature: z.ZodString;
    affected_file: z.ZodEffects<z.ZodString, string, string>;
    library_version: z.ZodOptional<z.ZodString>;
    risk_score: z.ZodNumber;
    confidence_score: z.ZodNumber;
    change_scope_estimate: z.ZodEnum<["trivial", "minor", "moderate", "major"]>;
    recommended_tier: z.ZodEnum<["Tier 1: Guardian", "Tier 2: Co-Pilot", "Tier 3: Autopilot"]>;
    tavily_query: z.ZodString;
    error_type: z.ZodOptional<z.ZodEnum<["type_error", "reference_error", "syntax_error", "build_error", "test_failure", "dependency_error", "config_error", "unknown"]>>;
    suggested_fix_category: z.ZodOptional<z.ZodEnum<["optional_chaining", "type_annotation", "import_fix", "version_bump", "config_change", "test_update", "migration", "refactor", "other"]>>;
    reasoning: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    error_signature: string;
    affected_file: string;
    risk_score: number;
    confidence_score: number;
    change_scope_estimate: "trivial" | "minor" | "moderate" | "major";
    recommended_tier: "Tier 1: Guardian" | "Tier 2: Co-Pilot" | "Tier 3: Autopilot";
    tavily_query: string;
    library_version?: string | undefined;
    error_type?: "unknown" | "type_error" | "reference_error" | "syntax_error" | "build_error" | "test_failure" | "dependency_error" | "config_error" | undefined;
    suggested_fix_category?: "optional_chaining" | "type_annotation" | "import_fix" | "version_bump" | "config_change" | "test_update" | "migration" | "refactor" | "other" | undefined;
    reasoning?: string | undefined;
}, {
    error_signature: string;
    affected_file: string;
    risk_score: number;
    confidence_score: number;
    change_scope_estimate: "trivial" | "minor" | "moderate" | "major";
    recommended_tier: "Tier 1: Guardian" | "Tier 2: Co-Pilot" | "Tier 3: Autopilot";
    tavily_query: string;
    library_version?: string | undefined;
    error_type?: "unknown" | "type_error" | "reference_error" | "syntax_error" | "build_error" | "test_failure" | "dependency_error" | "config_error" | undefined;
    suggested_fix_category?: "optional_chaining" | "type_annotation" | "import_fix" | "version_bump" | "config_change" | "test_update" | "migration" | "refactor" | "other" | undefined;
    reasoning?: string | undefined;
}>;
export type TriageOutput = z.infer<typeof TriageOutputSchema>;
/**
 * Input to the triage step (sanitized failure context)
 */
export declare const TriageInputSchema: z.ZodObject<{
    error_log: z.ZodString;
    repository_context: z.ZodOptional<z.ZodObject<{
        primary_language: z.ZodOptional<z.ZodString>;
        package_json: z.ZodOptional<z.ZodString>;
        tsconfig: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        primary_language?: string | undefined;
        package_json?: string | undefined;
        tsconfig?: string | undefined;
    }, {
        primary_language?: string | undefined;
        package_json?: string | undefined;
        tsconfig?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    error_log: string;
    repository_context?: {
        primary_language?: string | undefined;
        package_json?: string | undefined;
        tsconfig?: string | undefined;
    } | undefined;
}, {
    error_log: string;
    repository_context?: {
        primary_language?: string | undefined;
        package_json?: string | undefined;
        tsconfig?: string | undefined;
    } | undefined;
}>;
export type TriageInput = z.infer<typeof TriageInputSchema>;
//# sourceMappingURL=triage.d.ts.map