import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';
import { config } from '../utils/config.js';
import { createChildLogger } from '../utils/logger.js';
import { 
  CreatePROptions, 
  PRResult,
  CreateBranchOptions,
  CreateCommitOptions,
  CreateTreeOptions,
} from '@resonance/shared/schemas';

const log = createChildLogger({ component: 'github-client' });

/**
 * GitHub App client for repository operations
 */
export class GitHubClient {
  private appOctokit: Octokit;
  private installationTokens: Map<number, { token: string; expiresAt: Date }> = new Map();

  constructor() {
    // App-level client for getting installation tokens
    this.appOctokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: config.github.appId,
        privateKey: config.github.privateKey,
      },
    });

    log.info('GitHub App client initialized');
  }

  /**
   * Get installation token for a repository
   */
  async getInstallationToken(installationId: number): Promise<string> {
    // Check cache
    const cached = this.installationTokens.get(installationId);
    if (cached && cached.expiresAt > new Date()) {
      return cached.token;
    }

    log.debug({ installationId }, 'Fetching installation token');

    const { data } = await this.appOctokit.rest.apps.createInstallationAccessToken({
      installation_id: installationId,
      permissions: config.github.defaultPermissions,
    });

    const token = data.token;
    const expiresAt = new Date(data.expires_at);

    this.installationTokens.set(installationId, { token, expiresAt });

    log.debug({ installationId, expiresAt }, 'Installation token cached');
    return token;
  }

  /**
   * Get Octokit client authenticated for a specific installation
   */
  async getInstallationOctokit(installationId: number): Promise<Octokit> {
    const token = await this.getInstallationToken(installationId);
    return new Octokit({ auth: token });
  }

  /**
   * Create a new branch from a base commit
   */
  async createBranch(octokit: Octokit, options: CreateBranchOptions): Promise<void> {
    await octokit.rest.git.createRef({
      owner: options.owner,
      repo: options.repo,
      ref: `refs/heads/${options.branch_name}`,
      sha: options.base_sha,
    });

    log.info({ owner: options.owner, repo: options.repo, branch: options.branch_name }, 'Branch created');
  }

  /**
   * Create a tree with file changes
   */
  async createTree(octokit: Octokit, options: CreateTreeOptions): Promise<string> {
    const { data } = await octokit.rest.git.createTree({
      owner: options.owner,
      repo: options.repo,
      tree: options.tree.map(item => ({
        path: item.path,
        mode: item.mode,
        type: item.type,
        ...(item.content === undefined ? {} : { content: item.content }),
        ...(item.sha === undefined ? {} : { sha: item.sha }),
      })),
      ...(options.base_tree === undefined ? {} : { base_tree: options.base_tree }),
    });

    return data.sha;
  }

  /**
   * Create a commit
   */
  async createCommit(octokit: Octokit, options: CreateCommitOptions): Promise<string> {
    const { data } = await octokit.rest.git.createCommit({
      owner: options.owner,
      repo: options.repo,
      message: options.message,
      tree: options.tree_sha,
      parents: options.parents,
      ...(options.author === undefined ? {} : { author: options.author }),
    });

    return data.sha;
  }

  /**
   * Update a reference (branch) to point to a new commit
   */
  async updateRef(octokit: Octokit, owner: string, repo: string, branch: string, sha: string): Promise<void> {
    await octokit.rest.git.updateRef({
      owner,
      repo,
      ref: `heads/${branch}`,
      sha,
      force: false,
    });
  }

  /**
   * Create a pull request
   */
  async createPullRequest(octokit: Octokit, options: CreatePROptions): Promise<PRResult> {
    const { data } = await octokit.rest.pulls.create({
      owner: options.owner,
      repo: options.repo,
      title: options.title,
      body: options.body,
      head: options.head_branch,
      base: options.base_branch,
      draft: options.draft,
    });

    // Add labels if provided
    if (options.labels && options.labels.length > 0) {
      await octokit.rest.issues.addLabels({
        owner: options.owner,
        repo: options.repo,
        issue_number: data.number,
        labels: options.labels,
      });
    }

    // Add assignees if provided
    if (options.assignees && options.assignees.length > 0) {
      await octokit.rest.issues.addAssignees({
        owner: options.owner,
        repo: options.repo,
        issue_number: data.number,
        assignees: options.assignees,
      });
    }

    log.info({ 
      owner: options.owner, 
      repo: options.repo, 
      prNumber: data.number,
      draft: options.draft 
    }, 'Pull request created');

    return {
      number: data.number,
      url: data.url,
      html_url: data.html_url,
      state: data.state,
      draft: data.draft ?? false,
      head_branch: data.head.ref,
      base_branch: data.base.ref,
    };
  }

  /**
   * Add a comment to a PR
   */
  async addPRComment(octokit: Octokit, owner: string, repo: string, prNumber: number, body: string): Promise<void> {
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: prNumber,
      body,
    });
  }

  /**
   * Get file content from repository
   */
  async getFileContent(octokit: Octokit, owner: string, repo: string, path: string, ref: string): Promise<string | null> {
    try {
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref,
      });

      if ('content' in data && data.content) {
        return Buffer.from(data.content, 'base64').toString('utf-8');
      }
      return null;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get the default branch of a repository
   */
  async getDefaultBranch(octokit: Octokit, owner: string, repo: string): Promise<string> {
    const { data } = await octokit.rest.repos.get({ owner, repo });
    return data.default_branch;
  }

  /**
   * Get the latest commit SHA for a branch
   */
  async getBranchHeadSha(octokit: Octokit, owner: string, repo: string, branch: string): Promise<string> {
    const { data } = await octokit.rest.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`,
    });
    return data.object.sha;
  }

  /**
   * Check if a branch exists
   */
  async branchExists(octokit: Octokit, owner: string, repo: string, branch: string): Promise<boolean> {
    try {
      await octokit.rest.git.getRef({
        owner,
        repo,
        ref: `heads/${branch}`,
      });
      return true;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Trigger a workflow dispatch (for CI validation)
   */
  async triggerWorkflow(octokit: Octokit, owner: string, repo: string, workflowId: string, ref: string): Promise<void> {
    await octokit.rest.actions.createWorkflowDispatch({
      owner,
      repo,
      workflow_id: workflowId,
      ref,
    });
  }

  /**
   * Get workflow runs for a repository
   */
  async getWorkflowRuns(octokit: Octokit, owner: string, repo: string, workflowId: string, branch: string): Promise<any[]> {
    const { data } = await octokit.rest.actions.listWorkflowRuns({
      owner,
      repo,
      workflow_id: workflowId,
      branch,
      per_page: 10,
    });
    return data.workflow_runs;
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.appOctokit.rest.apps.getAuthenticated();
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const githubClient = new GitHubClient();