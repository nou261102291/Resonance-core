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
| **Phase 4** | 🔄 **IN PROGRESS** | Triage, Research & Fix Synthesis | Provider clients and orchestration exist; provider-backed end-to-end coverage remains |
| **Phase 5** | 🔄 **IN PROGRESS** | Autonomy Routing & Git Integration | Tier routing and GitHub App actions exist; robust patch application and verified promotion remain |
| **Phase 6** | 🔄 **IN PROGRESS** | Verification, Testing & Rollback Safety | Unit and webhook tests exist; candidate validation and rollback handling remain |
| **Phase 7** | 🔄 **IN PROGRESS** | Dashboard & Developer Experience | Standalone dashboard demo exists; live API state and PR workflow integration remain |
| **Phase 8** | ⏳ **PENDING** | Production Readiness & Demo Delivery | Deployment config, demo video, submission package |

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

### 4.1 Nano triage step
1. Use Nemotron Nano to classify the error.
2. Extract the likely file, failure mode, and risk level.
3. Produce strict structured JSON, not free-form text.

### 4.2 Tavily research step
1. Query Tavily using the triage output.
2. Prefer recent, version-aware, high-signal results.
3. Keep the research context small and relevant.

### 4.3 Ultra synthesis step
1. Use Nemotron Ultra only after triage and research complete.
2. Generate a minimal patch with a short explanation.
3. Avoid unrelated refactors or broad code changes.

### 4.4 Output of this phase
1. Structured failure metadata.
2. External research context.
3. Patch candidate and explanation.

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

### 6.2 Testing strategy
1. Unit test sanitization, triage parsing, routing, and PR composition.
2. Integration test webhook ingestion and Git provider actions.
3. Add one end-to-end demo test that exercises the full recovery loop.

### 6.3 Rollback and safety
1. Never auto-merge without policy checks.
2. Preserve failed state and logs for debugging.
3. Close or mark PRs stale when validation invalidates the proposed fix.

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

### 8.1 Production readiness
1. Add structured logging and traceability.
2. Set up environment-specific config for dev, staging, and production.
3. Define alerting for webhook failures, model errors, and Git provider failures.
4. Document rate limits, retry behavior, and operational ownership.

### 8.2 Deployment posture
1. Ship the hackathon version as a SaaS backend with repo installation.
2. Keep a clear path for enterprise self-hosting or VPC deployment.
3. Separate demo mode from real operating mode.

### 8.3 Demo package
1. Prepare the deliberate failure repo.
2. Record the 8-second Shadow Mode sequence.
3. Include architecture, trust model, and ROI in the submission.

### 8.4 Final acceptance criteria
1. A failure triggers the system automatically.
2. The agent triages, researches, and proposes a fix.
3. The system routes to the correct trust tier.
4. The engineer can review, approve, or let the policy automate the action.
5. The demo is polished enough to show without narration.

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
