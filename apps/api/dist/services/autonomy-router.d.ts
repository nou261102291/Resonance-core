import { FixPackage, AutonomyDecision, AutonomyTier, CostReceipt, TriageOutput } from '@resonance/shared/schemas';
/**
 * Autonomy Router - Handles tiered decision making and GitHub actions
 */
export declare class AutonomyRouter {
    /**
     * Determine autonomy tier based on triage output and configuration
     */
    determineTier(triage: TriageOutput): AutonomyTier;
    /**
     * Check if a file path matches any of the given patterns
     */
    private matchesPatterns;
    /**
     * Simple glob pattern matching
     */
    private matchPattern;
    /**
     * Build autonomy decision object
     */
    buildDecision(triage: TriageOutput, tier: AutonomyTier): AutonomyDecision;
    /**
     * Build human-readable reasoning for the tier decision
     */
    private buildReasoning;
    /**
     * Calculate cost receipt from token usage
     */
    calculateCostReceipt(triageTokens: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    }, synthesisTokens: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    }): CostReceipt;
    /**
     * Format cost receipt for PR body
     */
    formatCostReceipt(receipt: CostReceipt): string;
    /**
     * Generate PR body markdown
     */
    generatePRBody(fixPackage: FixPackage, decision: AutonomyDecision, costReceipt: CostReceipt): string;
    /**
     * Execute the fix based on autonomy decision
     */
    executeFix(fixPackage: FixPackage, installationId: number, repositoryId: number): Promise<{
        prUrl?: string;
        prNumber?: number;
        candidateSha: string;
        branchName: string;
        action: AutonomyDecision['action'];
    }>;
    /**
     * Parse unified diff into tree items for GitHub API
     */
    private parsePatchToTreeItems;
    /**
     * Get target branch for Tier 3 auto-merge
     */
    private getTargetBranch;
}
export declare const autonomyRouter: AutonomyRouter;
//# sourceMappingURL=autonomy-router.d.ts.map