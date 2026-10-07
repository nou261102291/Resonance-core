import { FailureContextSchema, GitHubCheckRunPayloadSchema, GitHubWorkflowRunPayloadSchema, } from '@resonance/shared/schemas';
import { verifyWebhookSignature } from '../utils/github-webhook.js';
import { sanitizeWebhookPayload, createAuditEntry, sanitizeString } from '../utils/sanitize.js';
import { createRequestLogger } from '../utils/logger.js';
import { randomUUID } from 'crypto';
import { config } from '../utils/config.js';
import { pipelineOrchestrator } from '../services/pipeline.js';
import { githubClient } from '../services/github-client.js';
export const webhookRoutes = async (server) => {
    // GitHub webhook endpoint
    server.post('/github', {
        schema: {
            body: {
                type: 'object',
                additionalProperties: true,
            },
            headers: {
                type: 'object',
                properties: {
                    'x-hub-signature-256': { type: 'string' },
                    'x-github-event': { type: 'string' },
                    'x-github-delivery': { type: 'string' },
                },
                required: ['x-hub-signature-256', 'x-github-event', 'x-github-delivery'],
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        status: { type: 'string' },
                        requestId: { type: 'string' },
                    },
                },
                400: { type: 'object', properties: { error: { type: 'string' }, message: { type: 'string' } } },
                401: { type: 'object', properties: { error: { type: 'string' }, message: { type: 'string' } } },
            },
        },
        config: {
            rawBody: true, // Need raw body for signature verification
        },
    }, async (request, reply) => {
        const requestId = request.headers['x-github-delivery'] ?? randomUUID();
        const log = createRequestLogger(requestId, {
            event: request.headers['x-github-event'],
            delivery: request.headers['x-github-delivery'],
        });
        log.info('Received GitHub webhook');
        // Verify signature
        const signature = request.headers['x-hub-signature-256'];
        const rawBody = request.rawBody;
        if (!signature || !rawBody) {
            log.warn('Missing X-Hub-Signature-256 header');
            return reply.status(401).send({
                error: 'Unauthorized',
                message: 'Missing webhook signature or raw request body',
            });
        }
        const isValid = verifyWebhookSignature(rawBody, signature, config.github.webhookSecret);
        if (!isValid) {
            log.warn('Invalid webhook signature');
            return reply.status(401).send({
                error: 'Unauthorized',
                message: 'Invalid webhook signature',
            });
        }
        // Parse and validate payload
        let payload;
        try {
            payload = JSON.parse(rawBody.toString('utf-8'));
        }
        catch (error) {
            log.error({ err: error }, 'Failed to parse webhook payload');
            return reply.status(400).send({
                error: 'Bad Request',
                message: 'Invalid JSON payload',
            });
        }
        const event = request.headers['x-github-event'];
        // Only process workflow_run and check_run events
        if (event !== 'workflow_run' && event !== 'check_run') {
            log.info({ event }, 'Ignoring non-target event type');
            return reply.send({ status: 'ignored', requestId });
        }
        const parseResult = event === 'workflow_run'
            ? GitHubWorkflowRunPayloadSchema.safeParse(payload)
            : GitHubCheckRunPayloadSchema.safeParse(payload);
        if (!parseResult.success) {
            log.warn({ errors: parseResult.error.flatten() }, 'Invalid webhook payload structure');
            return reply.status(400).send({
                error: 'Bad Request',
                message: 'Invalid GitHub webhook payload',
            });
        }
        const validatedPayload = parseResult.data;
        // Sanitize payload for logging
        const sanitizedPayload = sanitizeWebhookPayload(validatedPayload);
        log.debug({ payload: sanitizedPayload }, 'Sanitized webhook payload');
        const isFailure = 'workflow_run' in validatedPayload
            ? validatedPayload.workflow_run.conclusion === 'failure'
            : validatedPayload.check_run.conclusion === 'failure';
        if (!isFailure) {
            log.info({ event }, 'No failure to process');
            return reply.send({ status: 'no_failure', requestId });
        }
        const installationId = validatedPayload.installation?.id;
        if (!installationId) {
            log.warn('Missing GitHub App installation ID');
            return reply.status(400).send({
                error: 'Bad Request',
                message: 'Missing GitHub App installation ID',
            });
        }
        const failureContext = await extractFailureContext(validatedPayload, event, installationId, log);
        if (!failureContext) {
            log.info({ event }, 'Failure context could not be extracted');
            return reply.status(400).send({
                error: 'Bad Request',
                message: 'Failed to extract failure context',
            });
        }
        const originalErrorLog = failureContext.failure.errorLog;
        const sanitizationResult = sanitizeString(originalErrorLog);
        failureContext.failure.errorLog = sanitizationResult.sanitized;
        log.debug({ audit: createAuditEntry(originalErrorLog, sanitizationResult) }, 'Failure log sanitization audit');
        // Validate failure context
        const contextResult = FailureContextSchema.safeParse(failureContext);
        if (!contextResult.success) {
            log.error({ errors: contextResult.error.flatten() }, 'Invalid failure context');
            return reply.status(400).send({
                error: 'Bad Request',
                message: 'Failed to extract valid failure context',
            });
        }
        const validatedContext = contextResult.data;
        log.info({
            repo: validatedContext.repository.fullName,
            workflow: validatedContext.workflow.name,
            commit: validatedContext.commit.sha.substring(0, 7),
        }, 'Validated failure context ready for routing');
        // Process through pipeline
        const result = await pipelineOrchestrator.processFailure(validatedContext, installationId);
        if (!result.success) {
            log.error({ err: result.error }, 'Pipeline processing failed');
            return reply.status(500).send({
                error: 'Internal Server Error',
                message: result.error ?? 'Pipeline processing failed',
            });
        }
        return reply.send({
            status: 'completed',
            requestId,
            message: 'Failure processed successfully',
            tier: result.fixPackage?.autonomy_decision.tier,
            action: result.githubResult?.action,
            prUrl: result.githubResult?.prUrl,
            prNumber: result.githubResult?.prNumber,
            durationMs: result.durationMs,
        });
    });
};
/**
 * Extract failure context from GitHub webhook payload
 */
async function extractFailureContext(payload, event, installationId, requestLog) {
    if (event === 'workflow_run') {
        const p = payload;
        const run = p.workflow_run;
        if (run.conclusion !== 'failure') {
            return null;
        }
        const errorLog = await fetchLogs(run.logs_url, installationId, requestLog);
        return {
            repository: {
                owner: p.repository.owner.login,
                name: p.repository.name,
                fullName: p.repository.full_name,
                installationId: p.installation?.id,
            },
            workflow: {
                id: run.workflow_id,
                name: run.name,
                runNumber: run.run_number,
                runAttempt: run.run_attempt,
            },
            commit: {
                sha: run.head_sha,
                branch: run.head_branch,
            },
            failure: {
                jobName: 'workflow',
                conclusion: run.conclusion,
                logsUrl: run.logs_url,
                errorLog: errorLog ?? 'Workflow failed - logs not yet fetched',
            },
            timestamp: new Date().toISOString(),
        };
    }
    if (event === 'check_run') {
        const p = payload;
        const checkRun = p.check_run;
        if (checkRun.conclusion !== 'failure') {
            return null;
        }
        const errorLog = checkRun.output?.summary ?? 'Check run failed';
        return {
            repository: {
                owner: p.repository.owner.login,
                name: p.repository.name,
                fullName: p.repository.full_name,
                installationId: p.installation?.id,
            },
            workflow: {
                id: 0,
                name: checkRun.name,
                runNumber: 0,
                runAttempt: 1,
            },
            commit: {
                sha: checkRun.head_sha,
                branch: '',
            },
            failure: {
                jobName: checkRun.name,
                conclusion: checkRun.conclusion ?? 'failure',
                logsUrl: checkRun.details_url ?? checkRun.html_url,
                errorLog: errorLog ?? 'Check run failed',
            },
            timestamp: new Date().toISOString(),
        };
    }
    return null;
}
/**
 * Fetch logs from GitHub Actions using the installation token.
 * Returns the raw log content as a UTF‑8 string or null on failure.
 */
async function fetchLogs(logsUrl, installationId, requestLog) {
    try {
        const parsedLogsUrl = new URL(logsUrl);
        if (parsedLogsUrl.origin !== 'https://api.github.com' ||
            !/^\/repos\/[^/]+\/[^/]+\/actions\/runs\/\d+\/logs$/.test(parsedLogsUrl.pathname)) {
            requestLog.warn('Rejected unexpected workflow logs URL');
            return null;
        }
        const octokit = await githubClient.getInstallationOctokit(installationId);
        const { data } = await octokit.request(`GET ${parsedLogsUrl.pathname}`, {
            headers: { accept: 'application/octet-stream' },
        });
        if (typeof data !== 'string') {
            requestLog.warn('Workflow logs response was not plain text');
            return null;
        }
        return data;
    }
    catch (error) {
        requestLog.warn({ errorName: error instanceof Error ? error.name : 'UnknownError' }, 'Failed to fetch workflow logs');
        return null;
    }
}
//# sourceMappingURL=webhook.js.map