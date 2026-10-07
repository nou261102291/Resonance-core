# Security and Data Handling

## Ingress

- Verify `X-Hub-Signature-256` with HMAC-SHA256 over the original JSON request bytes before parsing the event for processing.
- Preserve the parsed object for Fastify validation while retaining the exact raw bytes for signature verification.
- Ignore unsupported events. Reject malformed supported event payloads before extracting a failure context.
- Keep the webhook secret, GitHub App key, and model/provider credentials in environment configuration; never include credentials in model prompts.

## Logs and Model Inputs

- Sanitize webhook payloads before debug logging.
- Sanitize failure log text before sending it to Nebius or writing the extracted excerpt to logs.
- Parse and validate model responses with Zod before routing or generating Git actions.
- Do not log raw provider credentials or full webhook secrets. Review any new log fields for sensitive values.

## GitHub Access

- Authenticate through GitHub App installation tokens scoped to an installation; do not use long-lived personal access tokens.
- Request only repository permissions needed for the operation. Current defaults include repository contents and pull-request write access, plus read access for Actions, checks, and metadata; review these permissions before deployment.
- Restrict target repositories to the installation context and retain human review for Guardian and Co-Pilot actions.

## Data Handling

- Failure text is sent to the configured model provider after sanitization; operators must ensure provider terms and retention settings are suitable for their repositories.
- The current system has no durable application database. Logs and provider-side retention are separate operational concerns and require environment-specific retention controls.
- The dashboard currently shows demo data and is not an authenticated operational console.

## Release Gates and Known Risks

- Do not enable production use until GitHub log retrieval, patch application, repository scoping, secret-redaction coverage, retry behavior, and the full webhook-to-PR integration path are validated.
- Do not enable autonomous merging or deployment. Tier 3 currently creates a branch and may create a PR; its merge path is not verified.
- Use mocked provider clients in automated tests. Use a dedicated test repository and installation for any live integration validation.
- Rotate credentials immediately if they appear in logs, test fixtures outside isolated tests, or model prompts.