import { FailureContext, FixPackage } from '@resonance/shared/schemas';
/**
 * Main Pipeline Orchestrator
 * Coordinates the full flow: Failure → Triage → Research → Synthesis → GitHub Action
 */
export declare class PipelineOrchestrator {
    /**
     * Process a failure through the complete pipeline
     */
    processFailure(failureContext: FailureContext, installationId: number): Promise<{
        success: boolean;
        fixPackage?: FixPackage;
        githubResult?: {
            prUrl?: string;
            prNumber?: number;
            candidateSha: string;
            branchName: string;
            action: string;
        };
        error?: string;
        durationMs: number;
    }>;
    /**
     * Run triage with Nemotron Nano
     */
    private runTriage;
    /**
     * Run research with Tavily
     */
    private runResearch;
    /**
     * Run synthesis with Nemotron 3 Ultra
     */
    private runSynthesis;
    /**
     * Health check for all pipeline dependencies
     */
    healthCheck(): Promise<{
        nebius: boolean;
        tavily: boolean;
        github: boolean;
    }>;
    private checkNebius;
    private checkGitHub;
}
export declare const pipelineOrchestrator: PipelineOrchestrator;
//# sourceMappingURL=pipeline.d.ts.map