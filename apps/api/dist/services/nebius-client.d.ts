import { TriageOutput } from '@resonance/shared/schemas';
import { SynthesisOutput } from '@resonance/shared/schemas';
type TokenUsage = {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
};
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
    }): Promise<TriageResult>;
    /**
     * Run synthesis with Nemotron 3 Ultra
     * Generates a unified diff patch from error context and research
     */
    runSynthesis(errorLog: string, triageData: TriageOutput, researchSnippets: Array<{
        source: string;
        title: string;
        url: string;
        relevant_content: string;
        confidence: number;
    }>, originalFileContent?: string): Promise<SynthesisOutput>;
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
    /**
     * Parse synthesis response from markdown
     */
    private parseSynthesisResponse;
    /**
     * Calculate cost for a model call
     */
    calculateCost(promptTokens: number, completionTokens: number, model: 'triage' | 'synthesis'): number;
}
export declare const nebiusClient: NebiusClient;
export {};
//# sourceMappingURL=nebius-client.d.ts.map