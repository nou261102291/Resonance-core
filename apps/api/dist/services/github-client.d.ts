import { Octokit } from '@octokit/rest';
import { CreatePROptions, PRResult, CreateBranchOptions, CreateCommitOptions, CreateTreeOptions } from '@resonance/shared/schemas';
/**
 * GitHub App client for repository operations
 */
export declare class GitHubClient {
    private appOctokit;
    private installationTokens;
    constructor();
    /**
     * Get installation token for a repository
     */
    getInstallationToken(installationId: number): Promise<string>;
    /**
     * Get Octokit client authenticated for a specific installation
     */
    getInstallationOctokit(installationId: number): Promise<Octokit>;
    /**
     * Create a new branch from a base commit
     */
    createBranch(octokit: Octokit, options: CreateBranchOptions): Promise<void>;
    /**
     * Create a tree with file changes
     */
    createTree(octokit: Octokit, options: CreateTreeOptions): Promise<string>;
    /**
     * Create a commit
     */
    createCommit(octokit: Octokit, options: CreateCommitOptions): Promise<string>;
    /**
     * Update a reference (branch) to point to a new commit
     */
    updateRef(octokit: Octokit, owner: string, repo: string, branch: string, sha: string): Promise<void>;
    /**
     * Create a pull request
     */
    createPullRequest(octokit: Octokit, options: CreatePROptions): Promise<PRResult>;
    /**
     * Add a comment to a PR
     */
    addPRComment(octokit: Octokit, owner: string, repo: string, prNumber: number, body: string): Promise<void>;
    /**
     * Get file content from repository
     */
    getFileContent(octokit: Octokit, owner: string, repo: string, path: string, ref: string): Promise<string | null>;
    /**
     * Get the default branch of a repository
     */
    getDefaultBranch(octokit: Octokit, owner: string, repo: string): Promise<string>;
    /**
     * Get the latest commit SHA for a branch
     */
    getBranchHeadSha(octokit: Octokit, owner: string, repo: string, branch: string): Promise<string>;
    /**
     * Check if a branch exists
     */
    branchExists(octokit: Octokit, owner: string, repo: string, branch: string): Promise<boolean>;
    /**
     * Trigger a workflow dispatch (for CI validation)
     */
    triggerWorkflow(octokit: Octokit, owner: string, repo: string, workflowId: string, ref: string): Promise<void>;
    /**
     * Get workflow runs for a repository
     */
    getWorkflowRuns(octokit: Octokit, owner: string, repo: string, workflowId: string, branch: string): Promise<any[]>;
    healthCheck(): Promise<boolean>;
}
export declare const githubClient: GitHubClient;
//# sourceMappingURL=github-client.d.ts.map