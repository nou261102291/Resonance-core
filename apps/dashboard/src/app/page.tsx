"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  GitPullRequest,
  RotateCw,
  ShieldCheck,
  Terminal,
  XCircle,
} from "lucide-react";
import type { DashboardHealth } from "@resonance/shared/schemas/health";

const pipelineSteps = [
  { name: "Webhook", detail: "Failure event accepted" },
  { name: "Triage", detail: "Failure classified and risk scored" },
  { name: "Research", detail: "Version-specific sources reviewed" },
  { name: "Synthesis", detail: "Single-file patch prepared" },
  { name: "Pull request", detail: "Reviewable candidate created" },
];

type ApiState = "checking" | "ready" | "not_ready" | "unavailable";
type RunState = "idle" | "running" | "complete";

export default function Dashboard() {
  const [apiState, setApiState] = useState<ApiState>("checking");
  const [readiness, setReadiness] = useState<DashboardHealth | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [runState, setRunState] = useState<RunState>("idle");
  const [activeStep, setActiveStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(() => new Set());
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    let active = true;

    const refresh = async () => {
      try {
        const response = await fetch("/api/health", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("API unavailable");
        }
        const result = await response.json() as DashboardHealth;
        if (!active) return;
        setReadiness(result);
        setApiState(result.status);
      } catch {
        if (!active) return;
        setReadiness(null);
        setApiState("unavailable");
      }
      if (active) setLastChecked(new Date());
    };

    void refresh();
    const interval = window.setInterval(() => void refresh(), 30_000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [refreshCount]);

  useEffect(() => {
    if (runState !== "running" || activeStep < 0) return;

    const timer = window.setTimeout(() => {
      setCompletedSteps((previous) => new Set(previous).add(activeStep));
      if (activeStep === pipelineSteps.length - 1) {
        setRunState("complete");
      } else {
        setActiveStep((step) => step + 1);
      }
    }, 850);

    return () => window.clearTimeout(timer);
  }, [activeStep, runState]);

  const runDemo = () => {
    setCompletedSteps(new Set());
    setActiveStep(0);
    setRunState("running");
  };

  const statusLabel = {
    checking: "Checking API",
    ready: "API configured",
    not_ready: "Configuration incomplete",
    unavailable: "API unavailable",
  }[apiState];

  return (
    <main className="ops-shell">
      <div className="ops-grid">
        <header className="ops-header">
          <a className="ops-brand" href="#overview" aria-label="Resonance Core overview">
            <span className="ops-brand-mark"><Activity size={19} /></span>
            <span>RESONANCE <b>CORE</b></span>
          </a>
          <div className="ops-header-right">
            <span className={`ops-connection ops-connection-${apiState}`}>
              <span className="ops-dot" />{statusLabel}
            </span>
            <span className="ops-env">OPERATOR CONSOLE</span>
          </div>
        </header>

        <section className="ops-intro" id="overview">
          <div>
            <div className="ops-kicker">CI/CD RECOVERY / OVERVIEW</div>
            <h1>Operations</h1>
            <p>Review service readiness and walk through the candidate recovery flow.</p>
          </div>
          <button className="ops-primary-button" onClick={runDemo} disabled={runState === "running"}>
            <Terminal size={16} />
            {runState === "running" ? "Demo running" : runState === "complete" ? "Replay demo" : "Run synthetic demo"}
          </button>
        </section>

        <section className="ops-metrics" aria-label="Operational summary">
          <div className="ops-metric">
            <div className="ops-metric-label">API readiness</div>
            <div className="ops-metric-value">
              {apiState === "ready" ? <CheckCircle2 size={19} /> : apiState === "not_ready" || apiState === "unavailable" ? <AlertTriangle size={19} /> : <RotateCw size={18} className="ops-spin" />}
              <span>{statusLabel}</span>
            </div>
            <div className="ops-metric-note">{lastChecked ? `Checked ${lastChecked.toLocaleTimeString()}` : "Waiting for readiness response"}</div>
          </div>
          <div className="ops-metric">
            <div className="ops-metric-label">Autonomy policy</div>
            <div className="ops-metric-value"><ShieldCheck size={19} /><span>Human review required</span></div>
            <div className="ops-metric-note">No automatic merge or promotion</div>
          </div>
          <div className="ops-metric">
            <div className="ops-metric-label">Pipeline activity</div>
            <div className="ops-metric-value"><Clock3 size={19} /><span>{runState === "running" ? "Synthetic run active" : runState === "complete" ? "Synthetic run complete" : "No live run feed"}</span></div>
            <div className="ops-metric-note">Production job history requires authenticated storage</div>
          </div>
        </section>

        <div className="ops-main-grid">
          <section className="ops-panel ops-pipeline">
            <div className="ops-panel-heading">
              <div>
                <div className="ops-kicker">WALKTHROUGH / SYNTHETIC DATA</div>
                <h2>Recovery pipeline</h2>
              </div>
              <span className={`ops-run-badge ops-run-${runState}`}>{runState === "running" ? "IN PROGRESS" : runState === "complete" ? "COMPLETE" : "NOT STARTED"}</span>
            </div>
            <ol className="ops-step-list">
              {pipelineSteps.map((step, index) => {
                const done = completedSteps.has(index);
                const current = runState === "running" && activeStep === index;
                return (
                  <li className={`ops-step ${done ? "is-done" : current ? "is-current" : ""}`} key={step.name}>
                    <span className="ops-step-icon">
                      {done ? <Check size={15} /> : current ? <RotateCw size={15} className="ops-spin" /> : <Circle size={14} />}
                    </span>
                    <span className="ops-step-copy"><b>{step.name}</b><small>{step.detail}</small></span>
                    <span className="ops-step-state">{done ? "Done" : current ? "Active" : "Waiting"}</span>
                  </li>
                );
              })}
            </ol>
            <div className="ops-demo-disclaimer">
              <AlertTriangle size={15} /> This walkthrough is simulated. It does not call providers, create a PR, or execute repository code.
            </div>
          </section>

          <section className="ops-panel ops-readiness">
            <div className="ops-panel-heading">
              <div>
                <div className="ops-kicker">LIVE SIGNAL / CONFIGURATION</div>
                <h2>Service readiness</h2>
              </div>
              <button className="ops-icon-button" onClick={() => setRefreshCount((count) => count + 1)} title="Refresh readiness" aria-label="Refresh readiness">
                <RotateCw size={16} />
              </button>
            </div>
            <p className="ops-panel-description">Configuration presence from the API readiness endpoint; not a live provider connectivity check.</p>
            <div className="ops-check-list">
              {([
                ["API configuration", readiness?.status === "ready" || readiness?.status === "not_ready" ? readiness.checks.config : undefined],
                ["Nebius key configured", readiness?.status === "ready" || readiness?.status === "not_ready" ? readiness.checks.nebius : undefined],
                ["Tavily key configured", readiness?.status === "ready" || readiness?.status === "not_ready" ? readiness.checks.tavily : undefined],
                ["GitHub App configured", readiness?.status === "ready" || readiness?.status === "not_ready" ? readiness.checks.github : undefined],
              ] as const).map(([label, passed]) => (
                <div className="ops-check-row" key={label}>
                  <span>{label}</span>
                  {passed === undefined ? <span className="ops-check-pending">—</span> : passed ? <CheckCircle2 size={16} className="ops-good" /> : <XCircle size={16} className="ops-bad" />}
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="ops-panel ops-pr-preview">
          <div className="ops-panel-heading">
            <div>
              <div className="ops-kicker">EXAMPLE ONLY / SYNTHETIC REPOSITORY</div>
              <h2>Pull request review</h2>
            </div>
            <span className="ops-tier"><ShieldCheck size={15} /> GUARDIAN · REVIEW REQUIRED</span>
          </div>
          <div className="ops-pr-content">
            <div className="ops-pr-title"><GitPullRequest size={18} /><span>Harden optional session access</span><span className="ops-pr-number">EXAMPLE</span></div>
            <div className="ops-pr-details">
              <div><span>Failure</span><p>Session user may be absent during auth callback.</p></div>
              <div><span>Proposed change</span><p>Use optional access and preserve the missing-user behavior for review.</p></div>
              <div><span>Next action</span><p>Inspect the patch and run repository checks in the isolated runner before merging.</p></div>
            </div>
            <div className="ops-pr-footer">
              <span><ShieldCheck size={14} /> Auto-merge disabled</span>
              <span>Illustrative estimate: $0.038 · not a provider invoice</span>
              <span className="ops-no-link">No live PR linked</span>
            </div>
          </div>
        </section>

        <footer className="ops-footer">
          <span>RESONANCE CORE <i>·</i> OPERATOR CONSOLE</span>
          <a href="https://github.com" target="_blank" rel="noreferrer">Repository access is managed by the GitHub App <ArrowUpRight size={13} /></a>
        </footer>
      </div>
    </main>
  );
}