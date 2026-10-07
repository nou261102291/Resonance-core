import { nebiusClient } from './nebius-client.js';
import { tavilyClient } from './tavily-client.js';
import { autonomyRouter } from './autonomy-router.js';
import { githubClient } from './github-client.js';
import { createChildLogger } from '../utils/logger.js';
import { randomUUID } from 'crypto';
import { sanitizeErrorLog } from '../utils/sanitize.js';
const log = createChildLogger({ component: 'pipeline' });
/**
 * Main Pipeline Orchestrator
 * Coordinates the full flow: Failure → Triage → Research → Synthesis → GitHub Action
 */
export class PipelineOrchestrator {
    /**
     * Process a failure through the complete pipeline
     */
    async processFailure(failureContext, installationId) {
        const startTime = Date.now();
        const requestId = randomUUID();
        log.info({
            requestId,
            repo: failureContext.repository.fullName,
            workflow: failureContext.workflow.name,
            commit: failureContext.commit.sha.substring(0, 7),
        }, 'Starting pipeline processing');
        try {
            // Step 1: Triage with Nemotron Nano
            log.info({ requestId }, 'Step 1: Running triage with Nemotron Nano');
            const triage = await this.runTriage(failureContext);
            // Step 2: Research with Tavily
            log.info({ requestId, query: triage.tavily_query }, 'Step 2: Researching with Tavily');
            const research = await this.runResearch(triage);
            // Step 3: Synthesis with Nemotron 3 Ultra
            log.info({ requestId }, 'Step 3: Synthesizing fix with Nemotron 3 Ultra');
            const synthesis = await this.runSynthesis(failureContext, triage, research);
            // Step 4: Determine autonomy tier and build decision
            log.info({ requestId }, 'Step 4: Determining autonomy tier');
            const tier = autonomyRouter.determineTier(triage);
            const decision = autonomyRouter.buildDecision(triage, tier);
            // Step 5: Calculate cost receipt
            const costReceipt = autonomyRouter.calculateCostReceipt(triage._tokenUsage ?? { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }, synthesis.token_usage);
            // Step 6: Build fix package
            const fixPackage = {
                repository: {
                    owner: failureContext.repository.owner,
                    name: failureContext.repository.name,
                },
                commit: {
                    sha: failureContext.commit.sha,
                },
                triage,
                synthesis,
                autonomy_decision: decision,
                cost_receipt: costReceipt,
                timestamp: new Date().toISOString(),
            };
            // Step 7: Execute GitHub action based on tier
            log.info({ requestId, tier: decision.tier, action: decision.action }, 'Step 5: Executing GitHub action');
            const githubResult = await autonomyRouter.executeFix(fixPackage, installationId);
            const durationMs = Date.now() - startTime;
            log.info({
                requestId,
                durationMs,
                tier: decision.tier,
                action: decision.action,
                prUrl: githubResult.prUrl,
            }, 'Pipeline completed successfully');
            return {
                success: true,
                fixPackage,
                githubResult,
                durationMs,
            };
        }
        catch (error) {
            const durationMs = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            log.error({
                requestId,
                durationMs,
                err: error
            }, 'Pipeline failed');
            return {
                success: false,
                error: errorMessage,
                durationMs,
            };
        }
    }
    /**
     * Run triage with Nemotron Nano
     */
    async runTriage(failureContext) {
        // Get original file content if possible (for context)
        const repositoryContext = {};
        try {
            const octokit = await githubClient.getInstallationOctokit(failureContext.repository.installationId ?? 0);
            const defaultBranch = await githubClient.getDefaultBranch(octokit, failureContext.repository.owner, failureContext.repository.name);
            // Try to get package.json and tsconfig for context
            const [pkgContent, tsconfigContent] = await Promise.allSettled([
                githubClient.getFileContent(octokit, failureContext.repository.owner, failureContext.repository.name, 'package.json', defaultBranch),
                githubClient.getFileContent(octokit, failureContext.repository.owner, failureContext.repository.name, 'tsconfig.json', defaultBranch),
            ]);
            if (pkgContent.status === 'fulfilled' && pkgContent.value) {
                repositoryContext.packageJson = pkgContent.value;
            }
            if (tsconfigContent.status === 'fulfilled' && tsconfigContent.value) {
                repositoryContext.tsconfig = tsconfigContent.value;
            }
            repositoryContext.primaryLanguage = 'typescript';
        }
        catch (error) {
            log.warn({ err: error }, 'Could not fetch repository context');
        }
        // Sanitize error log before sending to LLM
        const sanitizedErrorLog = sanitizeErrorLog(failureContext.failure.errorLog);
        return nebiusClient.runTriage(sanitizedErrorLog, repositoryContext);
    }
    /**
     * Run research with Tavily
     */
    async runResearch(triage) {
        return tavilyClient.searchWithFallback(triage.tavily_query);
    }
    /**
     * Run synthesis with Nemotron 3 Ultra
     */
    async runSynthesis(failureContext, triage, research) {
        // Get original file content for context
        let originalFileContent;
        try {
            const octokit = await githubClient.getInstallationOctokit(failureContext.repository.installationId ?? 0);
            const defaultBranch = await githubClient.getDefaultBranch(octokit, failureContext.repository.owner, failureContext.repository.name);
            const fileContent = await githubClient.getFileContent(octokit, failureContext.repository.owner, failureContext.repository.name, triage.affected_file, defaultBranch);
            if (fileContent) {
                originalFileContent = fileContent;
            }
        }
        catch (error) {
            log.warn({ err: error, file: triage.affected_file }, 'Could not fetch original file content');
        }
        // Sanitize error log
        const sanitizedErrorLog = sanitizeErrorLog(failureContext.failure.errorLog);
        return nebiusClient.runSynthesis(sanitizedErrorLog, triage, research.snippets, originalFileContent);
    }
    /**
     * Health check for all pipeline dependencies
     */
    async healthCheck() {
        const [nebius, tavily, github] = await Promise.allSettled([
            this.checkNebius(),
            tavilyClient.healthCheck(),
            this.checkGitHub(),
        ]);
        return {
            nebius: nebius.status === 'fulfilled' && nebius.value,
            tavily: tavily.status === 'fulfilled' && tavily.value,
            github: github.status === 'fulfilled' && github.value,
        };
    }
    async checkNebius() {
        try {
            // Simple test call
            await nebiusClient.runTriage('test error');
            return true;
        }
        catch {
            return false;
        }
    }
    async checkGitHub() {
        try {
            // Check if we can create an app-level client
            return await githubClient.healthCheck();
        }
        catch {
            return false;
        }
    }
}
// Export singleton instance
export const pipelineOrchestrator = new PipelineOrchestrator();
//# sourceMappingURL=pipeline.js.map