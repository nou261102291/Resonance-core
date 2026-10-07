# Phase 0: Product Definition and Scope Control

## 1. Product Positioning

**One-sentence positioning:**
> Resonance Core is an autonomous CI/CD recovery agent that installs on GitHub/GitLab, monitors pipeline failures, and turns broken builds into verified fixes—without human prompting.

**Elevator pitch:**
> Engineering teams lose hours every week context-switching to debug CI failures. Resonance Core acts as "CI/CD insurance": it detects the failure, researches the exact error against current library versions, generates a minimal patch, and opens a pull request—all in under 10 seconds. Teams install it once, configure their risk tolerance, and stop manually fixing routine pipeline breaks.

## 2. Target Audience (ICP)

| Segment | Size | Pain Point | Why Now |
|---------|------|------------|---------|
| Mid-market B2B SaaS | 50-500 engineers | High CI/CD minute burn, frequent dependency updates | AI tooling mature enough for autonomous action |
| Platform teams | 10-50 engineers | Internal developer experience, build reliability | Need to reduce toil without adding process |
| Open source maintainers | Variable | Flaky CI, contributor friction | Free tier provides immediate value |

## 3. Tiered Autonomy Policy

### Default Behavior: PR-First
All fixes start as pull requests. Direct commits to protected branches are **never** the default.

### Tier Definitions

| Tier | Name | Risk Profile | Action | Human Involvement |
|------|------|--------------|--------|-------------------|
| **Tier 1** | Guardian | High risk: core business logic, DB migrations, auth changes, >50 lines changed, confidence ≤ 6 | Create **Draft PR** with `do-not-merge` label, @mention last committer | **Mandatory** — human must review, edit, approve |
| **Tier 2** | Co-Pilot | Medium risk: dependency bumps, type fixes, test updates, config changes, confidence 7-8 | Create standard PR, auto-trigger CI validation | **Supervisory** — human reviews green CI, clicks "Approve & Merge" |
| **Tier 3** | Autopilot | Low risk: linting, formatting, reverting known flaky tests, <5 lines changed, confidence ≥ 9 | Push to `dev`/`staging` branch, auto-merge if policy allows, post Slack notification | **Zero** — human notified only: "✅ Resonance auto-resolved a linting failure in `auth.ts` (Cost: $0.02)" |

### Tier Assignment Logic
The Nemotron Nano triage step outputs:
```json
{
  "error_signature": "TypeError: Cannot read properties of undefined",
  "affected_file": "src/auth.ts",
  "library_version": "next-auth@4.22.1",
  "change_scope_estimate": "minor",
  "risk_score": 2,
  "confidence_score": 9,
  "recommended_tier": "Tier 3: Autopilot",
  "tavily_query": "next-auth@4.22.1 undefined property auth.ts github issues"
}
```

**Routing rules:**
- `risk_score ≥ 7` OR `confidence_score ≤ 6` → Tier 1
- `risk_score 4-6` → Tier 2
- `risk_score ≤ 3` AND `confidence_score ≥ 9` → Tier 3
- Everything else → Tier 2 (conservative default)

### Policy Configuration
Teams can configure via `.resonance/config.yml`:
```yaml
autonomy:
  default_tier: 2
  tier_3_allowed_patterns:
    - "*.eslintrc*"
    - "*.prettierrc*"
    - "**/*.test.ts"
    - "**/*.spec.ts"
  tier_1_required_patterns:
    - "**/auth/**"
    - "**/database/**"
    - "**/billing/**"
    - "**/migrations/**"
```

## 4. Demo Scenario: "Shadow Mode"

### Deliberate Bug Repository
A minimal Next.js + TypeScript repo with two known, easily reproducible failures:

**Bug A (Tier 3 - Autopilot Demo):**
- File: `src/lib/auth.ts`
- Error: Missing optional chaining on `session.user.id` after NextAuth v4.22.1 upgrade
- Fix: Change `session.user.id` → `session.user?.id`
- Expected: Auto-merge to `dev`, Slack notification, cost badge shows ~$0.02

**Bug B (Tier 1 - Guardian Demo):**
- File: `src/database/schema.ts`
- Error: Type mismatch in Prisma schema after version upgrade
- Fix: Requires human judgment on migration strategy
- Expected: Draft PR with `do-not-merge` label, @mention author, cost badge shows ~$0.05

### 8-Second Demo Flow
| Time | Screen | Action |
|------|--------|--------|
| 0:00-0:02 | Split screen: VS Code terminal (left), Resonance Dashboard (right) | `npm run build` fails with red TypeScript error in `auth.ts` |
| 0:02-0:03 | Dashboard pulses red | "🚨 Pipeline Failure Detected: Build #402" |
| 0:03-0:05 | Stepper animates | "Triage: Nemotron Nano analyzing... (Risk: Low)" → "Research: Querying Tavily for next-auth@4.22.1..." |
| 0:05-0:07 | Stepper continues | "Root Cause Identified. Synthesizing patch via Nemotron 3 Ultra..." |
| 0:07-0:08 | Green checkmark | "✅ Auto-Merged to `dev`. Total Cost: $0.038" + Slack toast |
| 0:08+ | GitHub PR view | Clean diff, explanation, cost receipt, "Re-run CI" button |

## 5. Success Criteria for MVP

### Functional
- [ ] GitHub App installs on a repo and receives `workflow_run` failure webhooks
- [ ] Webhook payload is verified, sanitized, and routed to triage
- [ ] Nemotron Nano outputs valid structured JSON with risk/confidence scores
- [ ] Tavily returns relevant, version-aware context snippets
- [ ] Nemotron Ultra generates a valid unified diff patch
- [ ] GitHub App creates PR/branch per tier policy
- [ ] Cost receipt appears in PR body with token breakdown
- [ ] Dashboard shows real-time stepper for the demo flow

### Non-Functional
- [ ] End-to-end latency < 10 seconds (webhook → PR created)
- [ ] Webhook signature verification rejects unauthorized requests
- [ ] Log sanitization removes all known secret patterns
- [ ] No credentials in model prompts or logs
- [ ] Unit test coverage ≥ 80% on core routing logic
- [ ] Integration test passes full loop on deliberate bug repo

### Hackathon Judging
- [ ] Technical Implementation: Nebius + Nemotron routing demonstrated
- [ ] Originality: Autonomous webhook trigger vs. passive assistants
- [ ] Practicality: ROI math (engineer minutes vs. API cents) visible
- [ ] Design & Polish: Dark-mode dashboard, clean PR, cost badge

## 6. Out of Scope for MVP

- GitLab support (GitHub only for hackathon)
- Multi-repo/organization dashboard
- Custom model fine-tuning
- Advanced policy DSL (YAML config only)
- Historical learning from merged PRs
- Slack/Teams bot beyond notifications
- Audit logging UI
- Team management / RBAC

---

*This document is the Phase 0 output. It defines what we build, for whom, under what rules, and how we demonstrate it.*