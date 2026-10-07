# Resonance Core

**Autonomous CI/CD Self-Healing Orchestrator** — An agent that detects pipeline failures, researches fixes, and generates verified pull requests.

## Overview

Resonance Core is a "CI/CD insurance" service that installs as a GitHub App. When a CI/CD pipeline fails, it:

1. **Receives** the failure webhook from GitHub Actions
2. **Sanitizes** logs (strips secrets, tokens, credentials)
3. **Triages** with Nemotron Nano (fast, cheap) → extracts error, assesses risk, creates Tavily query
4. **Researches** with Tavily → finds version-specific fixes from GitHub issues, Stack Overflow, docs
5. **Synthesizes** with Nemotron 3 Ultra (powerful) → generates minimal unified diff patch
6. **Routes** via Tiered Autonomy → Draft PR / Standard PR / Auto-merge to `dev`
7. **Reports** cost receipt in PR body (e.g., "Total compute cost: $0.038")

## Architecture

```
GitHub Actions (on: failure)
        │
        ▼
┌───────────────────────┐
│  Nebius Serverless    │
│  (Fastify + TypeScript)│
└───────────┬───────────┘
            │
    ┌───────┴───────┐
    ▼               ▼
┌─────────┐    ┌─────────┐
│ Nemotron│    │ Tavily  │
│  Nano   │    │ Search  │
└────┬────┘    └────┬────┘
     │              │
     └──────┬───────┘
            ▼
     ┌─────────────┐
     │ Nemotron 3  │
     │   Ultra     │
     └──────┬──────┘
            │
            ▼
    ┌───────────────┐
    │ GitHub App    │
    │ (Octokit)     │
    └───────┬───────┘
            │
    ┌───────┴───────┐
    ▼               ▼
 Draft PR      Auto-merge
 (Tier 1/2)    (Tier 3)
```

## Tiered Autonomy

| Tier | Name | Risk | Action | Human Review |
|------|------|------|--------|--------------|
| 1 | Guardian | High | Draft PR + `do-not-merge` label | Required |
| 2 | Co-Pilot | Medium | Standard PR + CI validation | Supervisory |
| 3 | Autopilot | Low | Push to `dev` + auto-merge | Notification only |

## Quick Start

### Prerequisites
- Node.js 20+
- pnpm 8.14+
- GitHub App credentials
- Nebius AI Studio API key
- Tavily API key

### Installation

```bash
# Clone and install
git clone <repo-url>
cd resonance-core
pnpm install

# Copy environment template
cp .env.example .env
# Edit .env with your credentials

# Build all packages
pnpm build

# Start development servers
pnpm dev
```

### Development

```bash
# Run API server (port 3000)
pnpm --filter=@resonance/api dev

# Run Dashboard (port 3001)
pnpm --filter=@resonance/dashboard dev

# Run tests
pnpm test

# Type check
pnpm typecheck

# Lint
pnpm lint
```

## Project Structure

```
resonance-core/
├── apps/
│   ├── api/              # Webhook ingestion, routing, GitHub integration
│   └── dashboard/        # Next.js real-time monitoring UI
├── packages/
│   └── shared/           # Zod schemas, types, utilities
├── config/
│   └── default-config.yml # Tiered autonomy configuration
├── demo-repo/            # Deliberately broken repo for testing
├── docs/                 # Architecture, runbooks, phase docs
├── .github/
│   └── copilot-instructions.md
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.json
└── .env.example
```

## Configuration

The autonomy behavior is configured via `.resonance/config.yml` in each repository:

```yaml
autonomy:
  default_tier: 2
  tier_3_allowed_patterns:
    - "*.eslintrc*"
    - "**/*.test.ts"
  tier_1_required_patterns:
    - "**/auth/**"
    - "**/database/**"
  risk_thresholds:
    tier_1_min: 7
    tier_3_max: 3
```

## Demo

The `demo-repo/` contains two deliberate bugs:

1. **Tier 3 (Autopilot)**: `src/lib/auth.ts` — Missing optional chaining after NextAuth v4.22.1 upgrade
2. **Tier 1 (Guardian)**: `src/database/schema.prisma` — Prisma enum migration requiring human judgment

Run the dashboard and click "Run Shadow Mode Demo" to see the 8-second autonomous recovery flow.

## Cost Tracking

Every model call captures token usage and calculates cost:

```
### 🧾 Resonance Core Compute Receipt
- **Triage**: Nemotron Nano (1,240 tokens) — $0.00012
- **Synthesis**: Nemotron 3 Ultra (3,850 tokens) — $0.00193
- **Total API Cost**: $0.00205
- **Est. Human Time Saved**: ~18 minutes
```

## Security

- All logs sanitized before external API calls (AWS keys, JWTs, DB URLs, Bearer tokens)
- GitHub App uses short-lived installation tokens
- No long-lived personal access tokens
- VPC-ready architecture for enterprise deployment

## License

MIT