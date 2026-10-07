import { z } from "zod";
export declare const SynthesisModelOutputSchema: z.ZodObject<{
    root_cause: z.ZodString;
    patch: z.ZodEffects<z.ZodString, string, string>;
    fix_explanation: z.ZodString;
    fix_confidence: z.ZodNumber;
    alternatives_considered: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    warnings: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strict", z.ZodTypeAny, {
    root_cause: string;
    patch: string;
    fix_explanation: string;
    fix_confidence: number;
    alternatives_considered?: string[] | undefined;
    warnings?: string[] | undefined;
}, {
    root_cause: string;
    patch: string;
    fix_explanation: string;
    fix_confidence: number;
    alternatives_considered?: string[] | undefined;
    warnings?: string[] | undefined;
}>;
export declare const SynthesisInputSchema: z.ZodObject<{
    error_log: z.ZodString;
    triage: z.ZodObject<Pick<{
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
    }, "error_signature" | "affected_file" | "library_version" | "risk_score" | "confidence_score" | "change_scope_estimate">, "strip", z.ZodTypeAny, {
        error_signature: string;
        affected_file: string;
        risk_score: number;
        confidence_score: number;
        change_scope_estimate: "trivial" | "minor" | "moderate" | "major";
        library_version?: string | undefined;
    }, {
        error_signature: string;
        affected_file: string;
        risk_score: number;
        confidence_score: number;
        change_scope_estimate: "trivial" | "minor" | "moderate" | "major";
        library_version?: string | undefined;
    }>;
    research: z.ZodObject<{
        snippets: z.ZodArray<z.ZodObject<{
            source: z.ZodString;
            title: z.ZodString;
            url: z.ZodString;
            relevant_content: z.ZodString;
            confidence: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            title: string;
            url: string;
            source: string;
            relevant_content: string;
            confidence: number;
        }, {
            title: string;
            url: string;
            source: string;
            relevant_content: string;
            confidence: number;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        snippets: {
            title: string;
            url: string;
            source: string;
            relevant_content: string;
            confidence: number;
        }[];
    }, {
        snippets: {
            title: string;
            url: string;
            source: string;
            relevant_content: string;
            confidence: number;
        }[];
    }>;
    original_file_content: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    error_log: string;
    triage: {
        error_signature: string;
        affected_file: string;
        risk_score: number;
        confidence_score: number;
        change_scope_estimate: "trivial" | "minor" | "moderate" | "major";
        library_version?: string | undefined;
    };
    research: {
        snippets: {
            title: string;
            url: string;
            source: string;
            relevant_content: string;
            confidence: number;
        }[];
    };
    original_file_content?: string | undefined;
}, {
    error_log: string;
    triage: {
        error_signature: string;
        affected_file: string;
        risk_score: number;
        confidence_score: number;
        change_scope_estimate: "trivial" | "minor" | "moderate" | "major";
        library_version?: string | undefined;
    };
    research: {
        snippets: {
            title: string;
            url: string;
            source: string;
            relevant_content: string;
            confidence: number;
        }[];
    };
    original_file_content?: string | undefined;
}>;
export type SynthesisInput = z.infer<typeof SynthesisInputSchema>;
/**
 * Structured output from Nemotron Ultra synthesis step
 */
export declare const SynthesisOutputSchema: z.ZodObject<{
    root_cause: z.ZodString;
    patch: z.ZodEffects<z.ZodString, string, string>;
    fix_explanation: z.ZodString;
    fix_confidence: z.ZodNumber;
    alternatives_considered: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    warnings: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
} & {
    files_changed: z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">;
    lines_changed: z.ZodNumber;
    token_usage: z.ZodObject<{
        prompt_tokens: z.ZodNumber;
        completion_tokens: z.ZodNumber;
        total_tokens: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    }, {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    }>;
}, "strict", z.ZodTypeAny, {
    root_cause: string;
    patch: string;
    fix_explanation: string;
    fix_confidence: number;
    files_changed: string[];
    lines_changed: number;
    token_usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    alternatives_considered?: string[] | undefined;
    warnings?: string[] | undefined;
}, {
    root_cause: string;
    patch: string;
    fix_explanation: string;
    fix_confidence: number;
    files_changed: string[];
    lines_changed: number;
    token_usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    alternatives_considered?: string[] | undefined;
    warnings?: string[] | undefined;
}>;
export type SynthesisOutput = z.infer<typeof SynthesisOutputSchema>;
//# sourceMappingURL=synthesis.d.ts.map