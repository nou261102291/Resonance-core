# Resonance Core — Copilot Instructions

## Project Context
- **Product**: Autonomous CI/CD self-healing orchestrator ("CI/CD insurance")
- **Stack**: TypeScript, Node.js (Express/Fastify), Next.js, Nebius AI API, Tavily API, Octokit
- **Core Loop**: GitHub webhook → sanitize → Nemotron Nano (triage) → Tavily (research) → Nemotron Ultra (synthesis) → tiered Git action

## Coding Standards
- Use strict TypeScript with `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`
- Validate all external inputs with Zod schemas
- Prefer functional style, early returns, small pure functions
- Never log secrets, tokens, or raw credentials
- All model outputs must be parsed through schemas before use

## Architecture Rules
- Webhook ingestion is the only entry point — no direct API exposure
- Nemotron Nano runs first, always; Ultra runs only after Tavily returns
- Tiered autonomy is enforced in code, not convention
- Cost tracking is mandatory on every model call

## Security
- Sanitize logs before any external call (AWS keys, JWTs, DB URLs, Bearer tokens)
- GitHub App uses installation tokens, scoped to installed repos only
- No long-lived personal access tokens in codebase
- Request only the GitHub App permissions used by the enabled workflow; fail closed when an installation lacks them

## Architecture and DevOps
- Keep orchestration, provider adapters, policy decisions, and transport handlers in separate ownership boundaries
- Make trust boundaries and failure behavior explicit; external data and model output are untrusted until schema-validated
- Prefer idempotent operations, bounded retries/timeouts, structured correlation IDs, and actionable health signals
- Ship changes behind automated typecheck, lint, test, and build gates; mock external providers in unit tests
- Treat staging validation, rollback behavior, and operational ownership as release requirements, not post-launch cleanup
- Never enable repository-controlled execution or autonomous promotion without the isolation and verification gates in the implementation guide
- Require validated provider token usage for model calls; never synthesize zero-cost defaults when usage is missing
- Emit request-correlated model, input/output token, and estimated-cost telemetry without logging prompts or credentials
- Label configured token-rate calculations as estimates and disclose external provider charges excluded from each receipt

## UI/UX
- Dark mode first (`#0D1117` background)
- Monospace font for all code/logs (JetBrains Mono)
- Real-time stepper shows: Webhook → Triage → Research → Synthesis → PR
- Cost badge visible in dashboard and PR body

## Testing
- Unit test: sanitization, triage parsing, routing logic, PR composition
- Integration test: webhook → PR on deliberate bug repo
- Mock all external APIs (Nebius, Tavily, GitHub) in tests