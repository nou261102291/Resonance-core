# Technical Implementation Plan: Resonance Core
**Production-Ready Build Structure for GitHub Copilot in VS Code**

This document defines a phased implementation plan for **Resonance Core**, an autonomous CI/CD self-healing orchestrator. The goal is to move from concept to a secure, production-grade hackathon build with clear scope, clean system boundaries, and a professional delivery path.

---

## 📊 Implementation Progress Tracker

| Phase | Status | Description | Key Artifacts |
|-------|--------|-------------|---------------|
| **Phase 0** | ✅ **COMPLETED** | Product Definition & Scope Control | `docs/phase-0-product-definition.md`, `.github/copilot-instructions.md`, `config/default-config.yml`, `demo-repo/` |
| **Phase 1.1** | ✅ **COMPLETED** | Environment Baseline | Monorepo, pnpm workspaces, TypeScript strict config, root package.json |
| **Phase 1.2** | ✅ **COMPLETED** | Copilot Context & Repo Structure | `.github/copilot-instructions.md`, `apps/api`, `apps/dashboard`, `packages/shared` |
| **Phase 1.3** | ✅ **COMPLETED** | Shared Schemas & Types | Zod schemas for webhook, triage, research, synthesis, GitHub integration |
| **Phase 1.4** | ✅ **COMPLETED** | Dashboard Foundation | Next.js 14, Tailwind, dark theme, real-time stepper component |
| **Phase 1.5** | ✅ **COMPLETED** | Config & Documentation | `.env.example`, `README.md`, `config/default-config.yml` |
| **Phase 2** | ✅ **COMPLETED** | Product Architecture & Trust Model | Architecture diagram, autonomy policy, security/data-handling docs |
| **Phase 3** | 🔄 **IN PROGRESS** | Webhook Ingestion & Sanitization | Secure ingress, event-specific validation, sanitization, and routing implemented; durable audit retention and live Actions log retrieval remain |
| **Phase 4** | 🔄 **IN PROGRESS** | Triage, Research & Fix Synthesis | Structured triage, validated research, and schema-checked single-file patch synthesis implemented; live-provider and patch-application verification remain |
| **Phase 5** | 🔄 **IN PROGRESS** | Autonomy Routing & Git Integration | Tier routing and GitHub App actions exist; robust patch application and verified promotion remain |
| **Phase 6** | 🔄 **IN PROGRESS** | Verification, Testing & Rollback Safety | Unit and webhook tests exist; candidate validation and rollback handling remain |
| **Phase 7** | 🔄 **IN PROGRESS** | Dashboard & Developer Experience | Standalone dashboard demo exists; live API state and PR workflow integration remain |
| **Phase 8** | ⏳ **PENDING** | Production Readiness & Demo Delivery | Multi-tenant security, repository-data lifecycle, isolated execution, operations, and launch gates |

---

## Phase 0: Product Definition and Scope Control ✅ **COMPLETED**

Set the product frame before writing code. Resonance Core is not a generic chatbot or a passive dashboard; it is a version-control-native service that monitors CI/CD failures, researches likely fixes, and proposes or applies remediations according to policy.

### Phase 0 goals
1. Define the product as **CI/CD insurance** for engineering teams.
2. Establish the default trust model: **PR first, direct changes only under explicit policy**.
3. Lock the initial scope to one repo, one CI provider, one knowledge source, and one primary demo path.

### Phase 0 outputs ✅ **ALL DELIVERED**
1. **One-sentence product positioning** → `docs/phase-0-product-definition.md`
2. **Tiered autonomy policy** → `config/default-config.yml` + `docs/phase-0-product-definition.md`
3. **Demo scenario with deliberately broken build** → `demo-repo/` with Tier 3 (auth.ts) and Tier 1 (schema.prisma) bugs
4. **Success criteria for production-ready MVP** → Documented in `docs/phase-0-product-definition.md`

### Phase 0 decision rules
1. Default behavior is to create a PR, not push to production.
2. High-risk changes must require human review.
3. Autonomous fixes are allowed only for low-risk, policy-approved classes of issues.

### Phase 0 Artifacts Created
| Artifact | Path | Description |
|----------|------|-------------|
| Product Definition | `docs/phase-0-product-definition.md` | Positioning, ICP, tier policy, demo flow, success criteria |
| Copilot Instructions | `.github/copilot-instructions.md` | Project context, coding standards, architecture rules, security, testing |
| Default Configuration | `config/default-config.yml` | Tier thresholds, file patterns, cost tracking, dashboard theme, sanitization patterns |
| Demo Repo - Tier 3 Bug | `demo-repo/src/lib/auth.ts` | Missing optional chaining (NextAuth v4.22.1) — auto-fixable |
| Demo Repo - Tier 1 Bug | `demo-repo/src/database/schema.prisma` | Prisma enum migration — requires human judgment |
| Demo CI Workflow | `demo-repo/.github/workflows/build.yml` | Fails on both bugs; simulates Resonance trigger |

---

## Phase 1: Repository, Environment, and Copilot Setup

Build the workspace so Copilot can operate with strong context and the team can ship safely.

### 1.1 Environment baseline ✅ **COMPLETED**
1. ✅ Node.js 20+ with TypeScript (strict mode enabled)
2. ✅ `pnpm` workspaces configured via `pnpm-workspace.yaml`
3. ✅ Root `package.json` with workspace scripts (dev, build, test, lint, typecheck, format)
4. ✅ Root `tsconfig.json` with strict TypeScript settings (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`)
5. ✅ `.env.example` with all required environment variables documented

**Artifacts Created:**
| Artifact | Path | Description |
|----------|------|-------------|
| Root package.json | `package.json` | Workspace scripts, devDependencies, pnpm packageManager |
| pnpm workspace | `pnpm-workspace.yaml` | Apps and packages workspace configuration |
| TypeScript config | `tsconfig.json` | Strict mode, path aliases for @resonance/* |
| Environment template | `.env.example` | All required secrets and config variables |

### 1.2 Copilot context file ✅ **COMPLETED**
Created `.github/copilot-instructions.md` with project rules.

### 1.3 Repo structure ✅ **COMPLETED**
Monorepo structure established:
1. ✅ `apps/api` — Fastify webhook server with Nebius, Tavily, Octokit dependencies
2. ✅ `apps/dashboard` — Next.js 14 App Router with Tailwind, dark theme
3. ✅ `packages/shared` — Zod schemas for webhook, triage, research, synthesis, GitHub integration
4. ✅ `docs` — Phase documentation
5. ✅ `config` — Default autonomy configuration
6. ✅ `demo-repo` — Deliberate bug repository for testing

**Artifacts Created:**
| Artifact | Path | Description |
|----------|------|-------------|
| API package.json | `apps/api/package.json` | Fastify, Octokit, OpenAI, Tavily, Zod, Pino |
| API tsconfig | `apps/api/tsconfig.json` | Extends root config, outDir=dist |
| Shared package.json | `packages/shared/package.json` | Zod dependency, exports config |
| Shared tsconfig | `packages/shared/tsconfig.json` | Extends root config |
| Shared schemas | `packages/shared/src/schemas/*.ts` | Webhook, triage, research, synthesis, GitHub |
| Shared types | `packages/shared/src/types/index.ts` | AppConfig, ProcessingContext, ProcessingResult |
| Dashboard package.json | `apps/dashboard/package.json` | Next.js 14, React 18, Tailwind, Lucide |
| Dashboard tsconfig | `apps/dashboard/tsconfig.json` | Next.js plugin, path aliases |
| Dashboard config | `apps/dashboard/next.config.js` | Transpile shared package |
| Tailwind config | `apps/dashboard/tailwind.config.js` | Dark mode, Resonance color palette |
| PostCSS config | `apps/dashboard/postcss.config.js` | Tailwind + autoprefixer |
| Global styles | `apps/dashboard/src/app/globals.css` | JetBrains Mono, custom scrollbar, animations |
| Layout | `apps/dashboard/src/app/layout.tsx` | Root layout with metadata |
| Dashboard page | `apps/dashboard/src/app/page.tsx` | Real-time stepper, cost receipt, PR preview |
| README | `README.md` | Project overview, architecture, quick start |

### 1.4 Output of this phase ✅ **ALL DELIVERED**
1. ✅ Working workspace with clear boundaries
2. ✅ Copilot instructions in place
3. ✅ Shared conventions for validation, logging, and naming
4. ✅ All core dependencies installed and configured
5. ✅ Dashboard foundation with real-time stepper demo

---

## Phase 2: Product Architecture and Trust Model ✅ **COMPLETED**

Define how requests flow through the system and where trust boundaries exist.

### 2.1 Core architecture ✅ **COMPLETED**
1. A GitHub or GitLab webhook fires on CI/CD failure.
2. A serverless backend receives, verifies, and sanitizes the payload.
3. Nemotron Nano extracts the failure summary and risk metadata.
4. Tavily supplies version-specific research context.
5. Nemotron Ultra synthesizes a patch when the issue is eligible.
6. GitHub App or GitLab App actions create PRs, branches, or approved deployments.

### 2.2 Trust engine ✅ **COMPLETED**
Use three autonomy tiers:
1. **Tier 1: Guardian** for high-risk changes, producing Draft PRs only.
2. **Tier 2: Co-Pilot** for moderate risk, producing standard PRs and CI validation.
3. **Tier 3: Autopilot** for low-risk, policy-approved changes, allowing controlled automatic promotion.

### 2.3 Safety boundaries ✅ **COMPLETED**
1. Sanitize logs before any external model call.
2. Keep credentials out of model prompts.
3. Restrict write permissions to the minimum necessary scope.
4. Require explicit approval gates for production-facing actions.

### 2.4 Output of this phase ✅ **COMPLETED**
1. ✅ Clear architecture diagram and request-flow documentation.
2. ✅ Written autonomy policy with tier thresholds and action rules.
3. ✅ Security and data-handling rules.

Phase 2 is complete as an architecture and trust-model milestone. These checks mark the design outputs, not completion of the corresponding production implementation; implementation progress is tracked in Phases 3–7.

### 2.5 Phase 2 completion evidence ✅ **DELIVERED**

| Artifact | Path | Evidence |
|----------|------|----------|
| Core architecture | `docs/phase-2-architecture.md` | Request flow, ownership boundaries, failure handling, and implementation limits |
| Autonomy policy | `docs/autonomy-policy.md` | Tier thresholds, mandatory Tier 3 allowlist, actions, and review rules |
| Security and data handling | `docs/security-and-data-handling.md` | Webhook authenticity, model/log handling, GitHub permissions, and release risks |

**Validation completed:**
1. ✅ `pnpm -r run typecheck`
2. ✅ `pnpm -r run lint`
3. ✅ `pnpm -r run test` — 13 API tests and 2 shared-schema tests passed; dashboard currently has no test files.
4. ✅ `pnpm -r run build`
5. ✅ Fastify injection tests cover liveness/readiness, valid and invalid HMAC signatures, malformed supported events, and a signed failure handed to a mocked pipeline.

**Scope boundary:** Provider APIs and GitHub repository actions were not called in these tests. Live integration, GitHub Actions log retrieval, robust patch application, and Tier 3 merge behavior remain unverified and are not claimed as complete by this phase.

### 2.6 What is next
1. **Complete failure context retrieval:** Fetch failed GitHub Actions job logs with the installation client, then redact them before logging or model use.
2. **Harden Git changes:** Replace the simplified diff-to-tree conversion with validated patch application, and test branch/PR actions using mocked GitHub APIs.
3. **Add verification and rollback gates:** Run the affected repository checks against candidate changes, block promotion on failure, and define stale-PR or rollback handling. Keep Tier 3 auto-merge disabled until this is verified.
4. **Connect the dashboard:** Feed real pipeline progress, tier decisions, validation results, and cost receipts into the existing demo UI.
5. **Run a controlled end-to-end demo:** After those gates are in place, exercise the full webhook-to-PR flow in a test installation before production-readiness and demo packaging.

---

## Phase 3: Webhook Ingestion and Sanitization

Implement the first production-critical path: receiving failures safely.

### 3.1 Webhook listener
1. Create a secure endpoint for incoming CI/CD events.
2. Verify request authenticity before processing.
3. Reject malformed or unauthorized payloads early.

### 3.2 Sanitization layer
1. Remove secrets, tokens, connection strings, and sensitive file paths.
2. Normalize logs into model-safe text.
3. Keep a redacted audit trail for debugging and traceability.

### 3.3 Validation rules
1. Validate the payload shape with a schema.
2. Validate required fields such as repo, commit, branch, and error context.
3. Fail closed when the event cannot be trusted.

### 3.4 Output of this phase
1. ✅ A secure webhook entrypoint verifies the HMAC signature before parsing and rejects malformed or unauthorized requests.
2. ✅ A reusable sanitization utility redacts sensitive error-log content and emits redaction metadata through structured logs without logging raw error text.
3. ✅ Event-specific Zod validation checks that the payload matches the declared GitHub event; the `FailureContextSchema`-parsed object is passed to the pipeline.

**Validation completed:** API typecheck passes; the API test suite passes (14 tests), including signature rejection, malformed and mismatched event payload rejection, and validated failure-context handoff. Live GitHub Actions log retrieval and durable audit retention remain unverified.

---

## Phase 4: Triage, Research, and Fix Synthesis

Build the agentic core that turns failure into a candidate fix.

### 4.1 Nano triage step ✅ **IMPLEMENTED**
1. ✅ Use Nemotron Nano to classify the sanitized failure and bounded repository context.
2. ✅ Extract the likely file, failure mode, and risk level; reject absolute or traversing file paths.
3. ✅ Require JSON output and validate it against `TriageOutputSchema` before routing. Failure logs and repository files are framed as untrusted data, not instructions.

### 4.2 Tavily research step ✅ **IMPLEMENTED**
1. ✅ Validate and bound the Tavily query derived from triage.
2. ✅ Validate provider responses, enforce configured source domains, require HTTPS, and rank results by score.
3. ✅ Limit result count and snippet size; use basic-search fallback and fail the research stage if both provider attempts fail.

**Validation completed:** Workspace tests pass (21 API tests and 3 shared-schema tests); workspace typechecks and lint pass. Provider calls are mocked in tests; live Nebius and Tavily integration remains unverified.

### 4.3 Ultra synthesis step ✅ **IMPLEMENTED**
1. ✅ Run Nemotron Ultra only after triage and a research result with at least one usable source.
2. ✅ Request structured JSON containing root cause, fix explanation, confidence, and a unified diff; reject malformed or incomplete output instead of filling defaults.
3. ✅ Require one diff for the triaged file, derive changed-file and line-count metadata from the patch, and frame logs, source material, and repository content as untrusted input.

### 4.4 Output of this phase
1. ✅ Schema-validated failure metadata from Nano.
2. ✅ Bounded, domain-filtered Tavily research context.
3. ✅ A validated single-file patch candidate with root cause, explanation, confidence, and derived change metadata.

**Validation completed:** API tests pass (25 tests) and shared-schema tests pass (3 tests); workspace typecheck, lint, and build pass. Nebius and Tavily are mocked in tests. Applying and verifying the patch against a real repository remains out of scope for this phase and is tracked in Phases 5–6.

---

## Phase 5: Autonomy Routing and Git Integration

Translate the model output into controlled repository actions.

### 5.1 GitHub or GitLab app integration
1. Use app-based auth, not long-lived personal tokens.
2. Scope permissions to the target repositories only.
3. Support branch creation, PR creation, and status updates.

### 5.2 Tiered action routing
1. Tier 1 creates a Draft PR with the patch and explanation.
2. Tier 2 creates a standard PR and triggers validation.
3. Tier 3 may promote to `dev` or an equivalent safe branch when policy allows.

### 5.3 Cost and receipt tracking
1. Capture token usage from model responses.
2. Calculate a cost summary for visibility.
3. Add a compact cost receipt to the PR body for transparency.

### 5.4 Output of this phase
1. Repo actions that match the trust tier.
2. Human-readable PR content.
3. Cost telemetry visible in the workflow.

---

## Phase 6: Verification, Testing, and Rollback Safety

Make the system trustworthy before polishing the UI.

### 6.1 Verification gates
1. Re-run the impacted build or test command after patch generation.
2. Fail the workflow if the fix does not improve the original error.
3. Escalate to human review if confidence is low or validation fails.
4. Execute repository-controlled install, build, and test commands only in the isolated runner defined by Phase 8; never execute customer code in the API or dashboard process.
5. Pass only bounded, sanitized result summaries back to the orchestrator; do not return runner credentials, environment variables, or unrestricted artifacts.

### 6.2 Testing strategy
1. Unit test sanitization, triage parsing, routing, and PR composition.
2. Integration test webhook ingestion and Git provider actions.
3. Add one end-to-end demo test that exercises the full recovery loop.

### 6.3 Rollback and safety
1. Never auto-merge without policy checks.
2. Preserve failed state and logs for debugging.
3. Close or mark PRs stale when validation invalidates the proposed fix.
4. Terminate and destroy the isolated runner and its working storage after each job, including on timeout, cancellation, and failure.

### 6.4 Output of this phase
1. Confidence that fixes are repeatable.
2. Clear failure handling.
3. A safety net for production use.

---

## Phase 7: Dashboard and Developer Experience

Design the operator experience around trust, clarity, and speed.

### 7.1 Dashboard purpose
1. Show live pipeline status.
2. Explain what the agent is doing.
3. Surface risk, cost, and outcome in one place.

### 7.2 UI priorities
1. Dark, high-contrast engineering aesthetic.
2. Real-time stepper for webhook, triage, research, synthesis, and PR creation.
3. Prominent trust indicators for tier selection and validation results.

### 7.3 Pull request UX
1. Short summary of the failure.
2. Brief root-cause explanation.
3. Minimal diff preview.
4. Clear next action for the engineer.

### 7.4 Output of this phase
1. A dashboard that communicates progress instantly.
2. A PR template that reads like a senior engineer wrote it.
3. A demo-friendly experience that builds trust quickly.

---

## Phase 8: Production Readiness and Demo Delivery

Finish with deployment discipline and a polished submission path.

### 8.1 Tenant isolation and repository access
1. Resolve the tenant from the authenticated GitHub App installation; never trust a tenant or repository identity supplied only in a request body.
2. Enforce installation-scoped authorization on every repository read, write, job, audit record, and dashboard query. Add automated cross-tenant access tests.
3. Request the minimum GitHub App permissions needed for the enabled workflow. Document each permission, require explicit installation, and immediately deny access after uninstall or permission revocation.
4. Add per-tenant webhook rate limits, concurrency limits, cost budgets, and abuse controls. Make delivery handling idempotent and reject replayed or stale deliveries.

### 8.2 Repository data lifecycle and privacy
1. Maintain a data inventory covering webhook payloads, logs, repository files, model prompts/responses, patches, audit records, and runner artifacts.
2. Minimize collected data and redact secrets before logs or model calls. Do not place raw payloads, credentials, or unredacted logs in ordinary application logs.
3. Encrypt tenant data in transit and at rest, keep tenant ownership explicit in storage boundaries, and restrict operator access with audited break-glass procedures.
4. Define configurable retention periods and deletion behavior for every stored data class. Test deletion on uninstall and customer request, including backups, caches, generated patches, and vendor-held data where supported.
5. Document which external providers receive data, their retention/training settings, and the customer-visible controls for opting out or limiting data sharing.

### 8.3 Isolated execution of untrusted repositories
1. Run dependency installation, build, and test commands in a disposable, per-job sandbox separated from the API and other tenants; use a hardened container or microVM with a non-root identity and restrictive syscall/filesystem controls.
2. Do not mount host paths, container-runtime sockets, cloud credentials, GitHub installation tokens, signing keys, or production secrets into the runner. Use narrowly scoped, short-lived credentials only when a documented validation step requires them.
3. Deny network egress by default. Allow only explicitly required destinations through controlled policy/proxy, and block access to metadata services, internal networks, and other tenant resources.
4. Enforce CPU, memory, disk, process-count, output-size, and wall-clock limits. Support cancellation and guaranteed cleanup after success, failure, or timeout.
5. Treat repository scripts, dependency lifecycle hooks, test output, and generated artifacts as hostile input. Sanitize bounded results before they return to the orchestrator or model providers.
6. Exercise the runner with malicious repositories and escape, resource-exhaustion, credential-access, and network-access tests before enabling customer repository execution.

### 8.4 Production operations and deployment
1. Separate development, staging, and production accounts, data, credentials, and provider applications; manage secrets through a production secret manager with rotation procedures.
2. Add structured redacted audit events, service health monitoring, alerts, SLOs, incident response, backup/restore, disaster-recovery, and capacity plans.
3. Document provider rate limits, retry/backoff behavior, queueing, idempotency, per-tenant quotas, cost controls, and operational ownership.
4. Complete threat modeling, dependency and image scanning, security review, and an independent penetration test before general availability.
5. Keep demo mode isolated from live customer installations. Ship as SaaS only after the gates in 8.6 pass; maintain a documented self-hosted/VPC path without weakening isolation defaults.

### 8.5 Demo package
1. Prepare the deliberate failure repository and run it only in the isolated test environment.
2. Record the 8-second Shadow Mode sequence using a non-production installation and synthetic data.
3. Include architecture, trust model, data-handling boundaries, and ROI in the submission.

### 8.6 Production launch acceptance criteria
1. A staging installation receives signed events, processes duplicate deliveries idempotently, and rejects revoked or out-of-scope repository access.
2. Automated authorization tests demonstrate that one tenant cannot read, mutate, or observe another tenant's repositories, jobs, logs, patches, audit events, or dashboard state.
3. Retention and deletion tests verify removal across primary storage, caches, generated artifacts, and documented backup/vendor retention windows.
4. Adversarial runner tests verify isolation, denied egress, resource limits, cancellation, cleanup, and absence of production credentials.
5. A controlled end-to-end staging run produces a validated patch and reviewable PR; candidate changes are verified, and automatic merge/promotion remains disabled until separately approved by Phase 6 gates.
6. Operational readiness is demonstrated through alert tests, restore exercises, incident ownership, and tenant-specific rate/cost limit tests.
7. Production access is not enabled while any of the above acceptance criteria are unmet.

---

## Recommended Build Order

1. Phase 0: Define the product and trust policy.
2. Phase 1: Set up the repo and Copilot context.
3. Phase 2: Finalize architecture and autonomy tiers.
4. Phase 3: Build secure webhook ingestion.
5. Phase 4: Implement triage, research, and synthesis.
6. Phase 5: Wire Git actions and cost receipts.
7. Phase 6: Add verification and rollback safety.
8. Phase 7: Build the dashboard and PR UX.
9. Phase 8: Harden for production and package the demo.

---

## Copilot Usage Guidance

Use Copilot for fast generation, but keep the structure deterministic:
1. Ask Copilot for one file or one function at a time.
2. Validate model outputs with schemas.
3. Review any Git operations manually before enabling autonomy.
4. Keep all high-risk actions behind explicit tier rules.

This structure keeps the guide professional, production-oriented, and ready for incremental implementation in VS Code.
