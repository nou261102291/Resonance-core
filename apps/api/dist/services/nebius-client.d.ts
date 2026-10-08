import { z } from 'zod';
import { type TriageOutput } from '@resonance/shared/schemas';
import { type SynthesisInput, type SynthesisOutput } from '@resonance/shared/schemas';
declare const TokenUsageSchema: z.ZodEffects<z.ZodObject<{
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
}>, {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
}, {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
}>;
type TokenUsage = z.infer<typeof TokenUsageSchema>;
export type TriageResult = TriageOutput & {
    _tokenUsage: TokenUsage;
};
/**
 * Nebius AI Studio client for Nemotron models
 * Uses OpenAI-compatible API
 */
export declare class NebiusClient {
    private client;
    private readonly triageModel;
    private readonly synthesisModel;
    constructor();
    /**
     * Run triage with Nemotron Nano
     * Returns structured JSON with error classification and risk assessment
     */
    runTriage(errorLog: string, repositoryContext?: {
        primaryLanguage?: string;
        packageJson?: string;
        tsconfig?: string;
    }, requestId?: string): Promise<TriageResult>;
    /**
     * Run synthesis with Nemotron 3 Ultra
     * Generates a unified diff patch from error context and research
     */
    runSynthesis(errorLog: string, triageData: TriageOutput, researchSnippets: SynthesisInput['research']['snippets'], originalFileContent?: string, requestId?: string): Promise<SynthesisOutput>;
    /**
     * Build system prompt for Nemotron Nano triage
     */
    private buildTriageSystemPrompt;
    /**
     * Build user prompt for triage
     */
    private buildTriageUserPrompt;
    /**
     * Build system prompt for Nemotron 3 Ultra synthesis
     */
    private buildSynthesisSystemPrompt;
    /**
     * Build user prompt for synthesis
     */
    private buildSynthesisUserPrompt;
    private summarizePatch;
    private validateTokenUsage;
    private logModelUsage;
    /**
     * Calculate cost for a model call
     */
    calculateCost(promptTokens: number, completionTokens: number, model: 'triage' | 'synthesis'): number;
}
export declare const nebiusClient: NebiusClient;
export {};
//# sourceMappingURL=nebius-client.d.ts.map