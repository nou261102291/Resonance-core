import { z } from "zod";
/**
 * Structured output from Nemotron Ultra synthesis step
 */
export declare const SynthesisOutputSchema: z.ZodObject<{
    root_cause: z.ZodString;
    patch: z.ZodString;
    fix_explanation: z.ZodString;
    fix_confidence: z.ZodNumber;
    files_changed: z.ZodArray<z.ZodString, "many">;
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
    alternatives_considered: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    warnings: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
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
/**
 * Input to the synthesis step
 */
export declare const SynthesisInputSchema: z.ZodObject<{
    triage: z.ZodObject<{
        error_signature: z.ZodString;
        affected_file: z.ZodString;
        library_version: z.ZodOptional<z.ZodString>;
        risk_score: z.ZodNumber;
        confidence_score: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        error_signature: string;
        affected_file: string;
        risk_score: number;
        confidence_score: number;
        library_version?: string | undefined;
    }, {
        error_signature: string;
        affected_file: string;
        risk_score: number;
        confidence_score: number;
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
    triage: {
        error_signature: string;
        affected_file: string;
        risk_score: number;
        confidence_score: number;
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
    triage: {
        error_signature: string;
        affected_file: string;
        risk_score: number;
        confidence_score: number;
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
//# sourceMappingURL=synthesis.d.ts.map