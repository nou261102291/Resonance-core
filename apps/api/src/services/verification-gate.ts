import type { VerificationResult } from '@resonance/shared/schemas';
import { VerificationResultSchema } from '@resonance/shared/schemas';
import { z } from 'zod';
import { githubClient } from './github-client.js';
import { createChildLogger } from '../utils/logger.js';

const log = createChildLogger({ component: 'verification-gate' });

const VerificationRequestSchema = z.object({
  requestId: z.string().min(1).max(128),
  installationId: z.number().int().positive(),
  repositoryId: z.number().int().positive(),
  owner: z.string().min(1).max(100),
  repo: z.string().min(1).max(100),
  pullNumber: z.number().int().positive(),
  result: z.unknown(),
}).strict();

export type VerificationRequest = z.infer<typeof VerificationRequestSchema>;

export interface VerificationOutcome {
  status: 'passed' | 'failed' | 'stale';
  candidateSha: string;
}

export class VerificationGate {
  async recordResult(input: unknown): Promise<VerificationOutcome> {
    const parsed = VerificationRequestSchema.safeParse(input);
    if (!parsed.success) {
      log.warn({
        requestId: typeof input === 'object' && input !== null && 'requestId' in input
          && typeof input.requestId === 'string'
          ? input.requestId
          : undefined,
        issueCodes: parsed.error.issues.map(({ code }) => code),
      }, 'Rejected invalid verification request');
      throw new Error('Verification request failed schema validation');
    }

    const request = parsed.data;
    const resultParsed = VerificationResultSchema.safeParse(request.result);
    if (!resultParsed.success) {
      log.warn({
        requestId: request.requestId,
        issueCodes: resultParsed.error.issues.map(({ code }) => code),
      }, 'Rejected invalid verification result');
      throw new Error('Verification result failed schema validation');
    }
    const result: VerificationResult = resultParsed.data;
    const octokit = await githubClient.getInstallationOctokit(request.installationId, request.repositoryId);
    const pullRequest = await githubClient.getPullRequestSnapshot(
      octokit,
      request.owner,
      request.repo,
      request.pullNumber,
    );

    if (pullRequest.headSha !== result.candidate_sha || pullRequest.state !== 'open') {
      log.warn({
        requestId: request.requestId,
        jobId: result.job_id,
        candidateSha: result.candidate_sha,
        currentHeadSha: pullRequest.headSha,
        pullRequestState: pullRequest.state,
      }, 'Ignored stale or terminal verification result');
      return { status: 'stale', candidateSha: result.candidate_sha };
    }

    const currentStatus = await githubClient.getCommitStatusState(
      octokit,
      request.owner,
      request.repo,
      result.candidate_sha,
      'resonance/patch-validation',
    );
    if (currentStatus !== 'pending') {
      log.warn({
        requestId: request.requestId,
        jobId: result.job_id,
        candidateSha: result.candidate_sha,
        currentStatus: currentStatus ?? 'missing',
      }, 'Ignored verification result outside the pending state');
      return { status: 'stale', candidateSha: result.candidate_sha };
    }

    const passed = result.outcome === 'passed' && result.original_failure_resolved;
    const statusRequest = {
      owner: request.owner,
      repo: request.repo,
      sha: result.candidate_sha,
      state: passed ? 'success' : result.outcome === 'timed_out' ? 'error' : 'failure',
      context: 'resonance/patch-validation',
      description: passed ? 'Candidate checks passed and original failure is resolved' : 'Candidate verification did not pass; human review required',
    } as const;

    if (passed) {
      await githubClient.createCommitStatus(octokit, statusRequest);
    } else {
      const [statusResult, closeResult] = await Promise.allSettled([
        githubClient.createCommitStatus(octokit, statusRequest),
        githubClient.closePullRequest(octokit, request.owner, request.repo, request.pullNumber),
      ]);
      if (statusResult.status === 'rejected' || closeResult.status === 'rejected') {
        log.error({
          requestId: request.requestId,
          jobId: result.job_id,
          statusUpdateFailed: statusResult.status === 'rejected',
          pullRequestClosureFailed: closeResult.status === 'rejected',
        }, 'Failed to fully apply verification rollback state');
        throw new Error('Verification failed and rollback handling was incomplete');
      }
    }

    log.info({
      requestId: request.requestId,
      jobId: result.job_id,
      candidateSha: result.candidate_sha,
      outcome: passed ? 'passed' : 'failed',
      checkCount: result.checks.length,
    }, 'Verification result recorded');

    return { status: passed ? 'passed' : 'failed', candidateSha: result.candidate_sha };
  }
}

export const verificationGate = new VerificationGate();