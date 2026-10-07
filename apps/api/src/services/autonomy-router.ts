import { githubClient } from './github-client.js';
import { config } from '../utils/config.js';
import { createChildLogger } from '../utils/logger.js';
import { 
  FixPackage, 
  AutonomyDecision, 
  AutonomyTier,
  CostReceipt,
  TriageOutput,
  TreeItem,
} from '@resonance/shared/schemas';

const log = createChildLogger({ component: 'autonomy-router' });

/**
 * Autonomy Router - Handles tiered decision making and GitHub actions
 */
export class AutonomyRouter {
  /**
   * Determine autonomy tier based on triage output and configuration
   */
  determineTier(triage: TriageOutput): AutonomyTier {
    const autonomyConfig = config.autonomy;

    // Hard overrides: Tier 1 required patterns
    if (this.matchesPatterns(triage.affected_file, autonomyConfig.tier1RequiredPatterns)) {
      log.info({ file: triage.affected_file }, 'Tier 1 required by pattern match');
      return 'Tier 1: Guardian';
    }

    // Hard overrides: Tier 3 allowed patterns with score checks
    if (this.matchesPatterns(triage.affected_file, autonomyConfig.tier3AllowedPatterns) &&
        triage.risk_score <= autonomyConfig.riskThresholds.tier3Max &&
        triage.confidence_score >= autonomyConfig.confidenceThresholds.tier3Min &&
        triage.change_scope_estimate === 'trivial') {
      log.info({ file: triage.affected_file }, 'Tier 3 allowed by pattern match');
      return 'Tier 3: Autopilot';
    }

    // Score-based routing
    if (triage.risk_score >= autonomyConfig.riskThresholds.tier1Min ||
        triage.confidence_score <= autonomyConfig.confidenceThresholds.tier1Max) {
      log.info({ riskScore: triage.risk_score, confidenceScore: triage.confidence_score }, 'Tier 1 by score');
      return 'Tier 1: Guardian';
    }

    // Conservative default
    log.info({ riskScore: triage.risk_score, confidenceScore: triage.confidence_score }, 'Tier 2 default');
    return 'Tier 2: Co-Pilot';
  }

  /**
   * Check if a file path matches any of the given patterns
   */
  private matchesPatterns(filePath: string, patterns: string[]): boolean {
    return patterns.some(pattern => this.matchPattern(filePath, pattern));
  }

  /**
   * Simple glob pattern matching
   */
  private matchPattern(filePath: string, pattern: string): boolean {
    let regexPattern = '^';
    for (let index = 0; index < pattern.length; index += 1) {
      const character = pattern[index];
      if (character === undefined) {
        continue;
      }

      if (character === '*' && pattern[index + 1] === '*') {
        if (pattern[index + 2] === '/') {
          regexPattern += '(?:.*/)?';
          index += 2;
        } else {
          regexPattern += '.*';
          index += 1;
        }
      } else if (character === '*') {
        regexPattern += '[^/]*';
      } else {
        regexPattern += '\\.^$+?()[]{}|'.includes(character) ? `\\${character}` : character;
      }
    }
    regexPattern += '$';
    
    try {
      return new RegExp(regexPattern).test(filePath);
    } catch {
      return false;
    }
  }

  /**
   * Build autonomy decision object
   */
  buildDecision(triage: TriageOutput, tier: AutonomyTier): AutonomyDecision {
    const actionMap: Record<AutonomyTier, AutonomyDecision['action']> = {
      'Tier 1: Guardian': 'create_draft_pr',
      'Tier 2: Co-Pilot': 'create_pr',
      'Tier 3: Autopilot': 'push_to_dev',
    };

    const requiresHumanReview = tier === 'Tier 1: Guardian' || tier === 'Tier 2: Co-Pilot';
    
    const labels: Record<AutonomyTier, string[]> = {
      'Tier 1: Guardian': ['do-not-merge', 'resonance:tier-1', 'needs-review'],
      'Tier 2: Co-Pilot': ['resonance:tier-2', 'needs-ci-validation'],
      'Tier 3: Autopilot': ['resonance:tier-3', 'auto-merge-candidate'],
    };

    return {
      tier,
      reasoning: this.buildReasoning(triage, tier),
      risk_score: triage.risk_score,
      confidence_score: triage.confidence_score,
      action: actionMap[tier],
      requires_human_review: requiresHumanReview,
      labels: labels[tier],
    };
  }

  /**
   * Build human-readable reasoning for the tier decision
   */
  private buildReasoning(triage: TriageOutput, tier: AutonomyTier): string {
    const reasons: string[] = [];

    if (tier === 'Tier 1: Guardian') {
      if (triage.risk_score >= config.autonomy.riskThresholds.tier1Min) {
        reasons.push(`High risk score (${triage.risk_score}/10)`);
      }
      if (triage.confidence_score <= config.autonomy.confidenceThresholds.tier1Max) {
        reasons.push(`Low confidence (${triage.confidence_score}/10)`);
      }
      if (this.matchesPatterns(triage.affected_file, config.autonomy.tier1RequiredPatterns)) {
        reasons.push('File matches high-risk pattern');
      }
    } else if (tier === 'Tier 3: Autopilot') {
      reasons.push(`Low risk (${triage.risk_score}/10)`);
      reasons.push(`High confidence (${triage.confidence_score}/10)`);
      reasons.push('Trivial change scope');
    } else {
      reasons.push(`Medium risk (${triage.risk_score}/10)`);
      reasons.push(`Medium confidence (${triage.confidence_score}/10)`);
    }

    return reasons.join('; ');
  }

  /**
   * Calculate cost receipt from token usage
   */
  calculateCostReceipt(
    triageTokens: { prompt_tokens: number; completion_tokens: number; total_tokens: number },
    synthesisTokens: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
  ): CostReceipt {
    const rates = config.costTracking.rates;

    const triageCost = ((triageTokens.prompt_tokens + triageTokens.completion_tokens) / 1000) * rates.nemotronNano;
    const synthesisCost = ((synthesisTokens.prompt_tokens + synthesisTokens.completion_tokens) / 1000) * rates.nemotronUltra;
    const totalCost = triageCost + synthesisCost;

    // Estimate human time saved (rough heuristic)
    const estimatedMinutes = Math.max(5, Math.round(totalCost * 10000)); // Very rough estimate

    return {
      triage: {
        model: config.nebius.models.triage,
        prompt_tokens: triageTokens.prompt_tokens,
        completion_tokens: triageTokens.completion_tokens,
        cost_usd: Number(triageCost.toFixed(6)),
      },
      synthesis: {
        model: config.nebius.models.synthesis,
        prompt_tokens: synthesisTokens.prompt_tokens,
        completion_tokens: synthesisTokens.completion_tokens,
        cost_usd: Number(synthesisCost.toFixed(6)),
      },
      total_cost_usd: Number(totalCost.toFixed(6)),
      estimated_human_minutes_saved: estimatedMinutes,
    };
  }

  /**
   * Format cost receipt for PR body
   */
  formatCostReceipt(receipt: CostReceipt): string {
    return `### 🧾 Resonance Core Compute Receipt

- **Triage**: ${receipt.triage.model} (${receipt.triage.prompt_tokens + receipt.triage.completion_tokens} tokens) — $${receipt.triage.cost_usd.toFixed(6)}
- **Synthesis**: ${receipt.synthesis.model} (${receipt.synthesis.prompt_tokens + receipt.synthesis.completion_tokens} tokens) — $${receipt.synthesis.cost_usd.toFixed(6)}
- **Total API Cost**: $${receipt.total_cost_usd.toFixed(6)}
- **Est. Human Time Saved**: ~${receipt.estimated_human_minutes_saved} minutes`;
  }

  /**
   * Generate PR body markdown
   */
  generatePRBody(
    fixPackage: FixPackage,
    decision: AutonomyDecision,
    costReceipt: CostReceipt
  ): string {
    const { triage, synthesis } = fixPackage;
    const tierEmoji = {
      'Tier 1: Guardian': '🛡️',
      'Tier 2: Co-Pilot': '🤝',
      'Tier 3: Autopilot': '🚀',
    };

    return `## ${tierEmoji[decision.tier]} Autonomous Fix Generated by Resonance Core

**Tier**: ${decision.tier}  
**Risk Score**: ${decision.risk_score}/10  
**Confidence**: ${decision.confidence_score}/10  
**Action**: ${decision.action.replace('_', ' ')}

---

### 🚨 Failure Context
\`\`\`
${triage.error_signature}
\`\`\`
**File**: \`${triage.affected_file}\`  
**Library**: ${triage.library_version ?? 'Unknown'}

---

### 🔍 Root Cause Analysis
${synthesis.root_cause}

---

### 💡 Applied Fix
${synthesis.fix_explanation}

---

### 📜 Code Diff
<details>
<summary>View unified diff</summary>

\`\`\`diff
${synthesis.patch}
\`\`\`
</details>

---

### ⚠️ Warnings
${synthesis.warnings?.length ? synthesis.warnings.map(w => `- ${w}`).join('\n') : 'None'}

---

${this.formatCostReceipt(costReceipt)}

---

*Generated by Resonance Core v0.1.0 | Tier: ${decision.tier} | ${new Date().toISOString()}*`;
  }

  /**
   * Execute the fix based on autonomy decision
   */
  async executeFix(fixPackage: FixPackage, installationId: number): Promise<{
    prUrl?: string;
    prNumber?: number;
    branchName: string;
    action: AutonomyDecision['action'];
  }> {
    const { triage, synthesis, autonomy_decision: decision } = fixPackage;
    const { owner, name: repo } = fixPackage.repository;

    log.info({ 
      owner, 
      repo, 
      tier: decision.tier,
      action: decision.action 
    }, 'Executing fix');

    const octokit = await githubClient.getInstallationOctokit(installationId);
    const defaultBranch = await githubClient.getDefaultBranch(octokit, owner, repo);
    const baseSha = await githubClient.getBranchHeadSha(octokit, owner, repo, defaultBranch);

    // Create branch name
    const timestamp = Date.now();
    const shortSha = fixPackage.commit.sha.substring(0, 7);
    const branchName = `resonance/fix-${shortSha}-${timestamp}`;

    // Create branch
    await githubClient.createBranch(octokit, {
      owner,
      repo,
      branch_name: branchName,
      base_sha: baseSha,
    });

    // Parse patch to create tree items
    const treeItems = this.parsePatchToTreeItems(synthesis.patch, triage.affected_file);
    
    // Create tree
    const treeSha = await githubClient.createTree(octokit, {
      owner,
      repo,
      tree: treeItems,
      base_tree: baseSha,
    });

    // Create commit
    const commitSha = await githubClient.createCommit(octokit, {
      owner,
      repo,
      branch: branchName,
      message: `fix: ${synthesis.fix_explanation}\n\nResonance Core: ${decision.tier}`,
      tree_sha: treeSha,
      parents: [baseSha],
      author: {
        name: 'Resonance Core',
        email: 'resonance-core@users.noreply.github.com',
      },
    });

    // Update branch ref
    await githubClient.updateRef(octokit, owner, repo, branchName, commitSha);

    // Execute based on tier
    let prUrl: string | undefined;
    let prNumber: number | undefined;

    if (decision.action === 'create_draft_pr' || decision.action === 'create_pr') {
      const isDraft = decision.action === 'create_draft_pr';
      
      const prResult = await githubClient.createPullRequest(octokit, {
        owner,
        repo,
        base_branch: defaultBranch,
        head_branch: branchName,
        title: `[Resonance] ${synthesis.fix_explanation}`,
        body: this.generatePRBody(fixPackage, decision, fixPackage.cost_receipt),
        draft: isDraft,
        labels: decision.labels,
      });

      prUrl = prResult.html_url;
      prNumber = prResult.number;

      log.info({ prUrl, prNumber, draft: isDraft }, 'Pull request created');
    } else if (decision.action === 'push_to_dev') {
      // For Tier 3, push to dev branch (or default if no dev)
      const targetBranch = await this.getTargetBranch(octokit, owner, repo, defaultBranch);
      
      if (targetBranch !== defaultBranch) {
        // Create PR to dev branch for auto-merge
        const prResult = await githubClient.createPullRequest(octokit, {
          owner,
          repo,
          base_branch: targetBranch,
          head_branch: branchName,
          title: `[Resonance] ${synthesis.fix_explanation}`,
          body: this.generatePRBody(fixPackage, decision, fixPackage.cost_receipt),
          draft: false,
          labels: decision.labels,
        });

        // Enable auto-merge if configured
        try {
          await octokit.rest.pulls.update({
            owner,
            repo,
            pull_number: prResult.number,
            merge_method: 'squash',
          });
          // Note: Actual auto-merge requires GitHub App permissions and branch protection rules
        } catch (e) {
          log.warn({ err: e }, 'Could not enable auto-merge');
        }

        prUrl = prResult.html_url;
        prNumber = prResult.number;
      }
    }

    return {
      ...(prUrl === undefined ? {} : { prUrl }),
      ...(prNumber === undefined ? {} : { prNumber }),
      branchName,
      action: decision.action,
    };
  }

  /**
   * Parse unified diff into tree items for GitHub API
   */
  private parsePatchToTreeItems(patch: string, affectedFile: string): TreeItem[] {
    // This is a simplified parser - in production, use a proper diff parser
    // For now, we'll get the file content from the patch
    const lines = patch.split('\n');
    const fileLines: string[] = [];
    let inTargetFile = false;

    for (const line of lines) {
      if (line.startsWith('+++') && line.includes(affectedFile)) {
        inTargetFile = true;
        continue;
      }
      if (line.startsWith('---')) {
        inTargetFile = false;
        continue;
      }
      if (inTargetFile && !line.startsWith('@@')) {
        // Remove diff markers
        if (line.startsWith('+')) {
          fileLines.push(line.substring(1));
        } else if (!line.startsWith('-')) {
          fileLines.push(line);
        }
      }
    }

    // If we couldn't parse, return empty - the actual implementation would fetch the file
    // and apply the patch properly
    return [{
      path: affectedFile,
      mode: '100644',
      type: 'blob' as const,
      content: fileLines.join('\n') || '// Patch applied by Resonance Core',
    }];
  }

  /**
   * Get target branch for Tier 3 auto-merge
   */
  private async getTargetBranch(octokit: any, owner: string, repo: string, defaultBranch: string): Promise<string> {
    // Check if 'dev' branch exists
    const devExists = await githubClient.branchExists(octokit, owner, repo, 'dev');
    return devExists ? 'dev' : defaultBranch;
  }
}

// Export singleton instance
export const autonomyRouter = new AutonomyRouter();