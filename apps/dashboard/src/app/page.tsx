"use client";

import { useState } from "react";
import { 
  Zap, 
  Brain, 
  Search, 
  GitBranch, 
  CheckCircle, 
  DollarSign,
  Terminal,
  Shield,
  Activity
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Step {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

interface TierColorConfig {
  bg: string;
  border: string;
  text: string;
  icon: LucideIcon;
}

const steps: Step[] = [
  { id: "webhook", label: "Webhook Received", icon: Zap, description: "GitHub Actions failure detected" },
  { id: "triage", label: "Nano Triage", icon: Brain, description: "Nemotron Nano analyzing stack trace" },
  { id: "research", label: "Tavily Research", icon: Search, description: "Querying for version-specific fixes" },
  { id: "synthesis", label: "Ultra Synthesis", icon: Brain, description: "Nemotron 3 Ultra generating patch" },
  { id: "pr", label: "PR Created", icon: GitBranch, description: "Fix committed and PR opened" },
];

const tierColors: Record<"Tier 1: Guardian" | "Tier 2: Co-Pilot" | "Tier 3: Autopilot", TierColorConfig> = {
  "Tier 1: Guardian": { bg: "bg-resonance-error/20", border: "border-resonance-error", text: "text-resonance-error", icon: Shield },
  "Tier 2: Co-Pilot": { bg: "bg-resonance-warning/20", border: "border-resonance-warning", text: "text-resonance-warning", icon: Activity },
  "Tier 3: Autopilot": { bg: "bg-resonance-success/20", border: "border-resonance-success", text: "text-resonance-success", icon: Zap },
};

type Tier = keyof typeof tierColors;

export default function Dashboard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [tier, setTier] = useState<Tier>("Tier 3: Autopilot");
  const [cost, setCost] = useState("$0.00");
  const [isRunning, setIsRunning] = useState(false);

  const runDemo = () => {
    setIsRunning(true);
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setCost("$0.00");
    setTier("Tier 3: Autopilot");

    const stepDurations = [800, 1200, 1500, 2000, 1000];
    let cumulative = 0;

    steps.forEach((_, index) => {
      const duration = stepDurations[index];
      if (duration === undefined) {
        return;
      }

      cumulative += duration;
      setTimeout(() => {
        setCompletedSteps(prev => new Set([...prev, index]));
        if (index < steps.length - 1) {
          setCurrentStep(index + 1);
        }
      }, cumulative);
    });

    // Update cost progressively
    setTimeout(() => setCost("$0.008"), 1000);
    setTimeout(() => setCost("$0.022"), 2500);
    setTimeout(() => setCost("$0.038"), 4500);

    setTimeout(() => setIsRunning(false), cumulative + 500);
  };

  const tierConfig = tierColors[tier];

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3">
              <Zap className="text-resonance-accent" size={32} />
              Resonance Core
            </h1>
            <p className="text-resonance-textMuted mt-1 text-sm md:text-base">
              Autonomous CI/CD Self-Healing Orchestrator
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={runDemo}
              disabled={isRunning}
              className="px-6 py-3 bg-resonance-accent text-resonance-bg font-mono font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2"
            >
              <Terminal className="w-4 h-4" />
              {isRunning ? "Running Demo..." : "Run Shadow Mode Demo"}
            </button>
          </div>
        </header>

{/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatusCard
            title="Current Tier"
            value={tier}
            icon={tierConfig.icon}
            className={tierConfig.bg + " " + tierConfig.border}
            valueClassName={tierConfig.text}
          />
          <StatusCard
            title="Total Cost"
            value={cost}
            icon={DollarSign}
            className="bg-resonance-bgSecondary border-resonance-border"
            valueClassName="text-resonance-accent"
          />
          <StatusCard
            title="Status"
            value={isRunning ? "Processing..." : "Idle"}
            icon={isRunning ? Activity : CheckCircle}
            className={isRunning ? "bg-resonance-accent/20 border-resonance-accent" : "bg-resonance-success/20 border-resonance-success"}
            valueClassName={isRunning ? "text-resonance-accent animate-pulse" : "text-resonance-success"}
          />
        </div>

        {/* Stepper */}
        <section className="bg-resonance-bgSecondary border border-resonance-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Activity className="text-resonance-accent" size={20} />
            Agent Pipeline
          </h2>
          
          <div className="space-y-4">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.has(index);
              const isCurrent = currentStep === index && isRunning && !isCompleted;
              const isPending = !isCompleted && !isCurrent;

              return (
                <StepRow
                  key={step.id}
                  step={step}
                  index={index}
                  isCompleted={isCompleted}
                  isCurrent={isCurrent}
                  isPending={isPending}
                />
              );
            })}
          </div>
        </section>

        {/* Cost Receipt */}
        <section className="bg-resonance-bgSecondary border border-resonance-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="text-resonance-accent" size={20} />
            Compute Receipt
          </h2>
          
          <div className="font-mono text-sm space-y-2">
            <div className="flex justify-between text-resonance-textMuted">
              <span>Nemotron Nano (Triage)</span>
              <span>1,240 tokens</span>
            </div>
            <div className="flex justify-between text-resonance-textMuted">
              <span>Nemotron 3 Ultra (Synthesis)</span>
              <span>3,850 tokens</span>
            </div>
            <div className="border-t border-resonance-border pt-2 flex justify-between">
              <span className="font-medium">Total API Cost</span>
              <span className="font-medium text-resonance-accent">{cost}</span>
            </div>
            <div className="flex justify-between text-resonance-textMuted text-xs">
              <span>Est. Human Time Saved</span>
              <span>~18 minutes</span>
            </div>
          </div>
        </section>

        {/* PR Preview */}
        <section className="bg-resonance-bgSecondary border border-resonance-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <GitBranch className="text-resonance-accent" size={20} />
            Generated Pull Request Preview
          </h2>
          
          <div className="bg-resonance-bg border border-resonance-border rounded-lg p-4 font-mono text-sm overflow-x-auto">
            <div className="text-resonance-textMuted mb-3">## 🛠️ Autonomous Fix Generated by Resonance Core</div>
            <div className="text-resonance-textMuted mb-3">**🚨 Failure Context**: <code>TypeError: Cannot read properties of undefined</code> in <code>src/lib/auth.ts</code></div>
            <div className="text-resonance-textMuted mb-3">**🔍 Root Cause**: NextAuth v4.22.1 changed session.user to be potentially undefined</div>
            <div className="text-resonance-textMuted mb-3">**💡 Applied Fix**: Added optional chaining operator (<code>?.</code>) to match new type definition</div>
            <details className="mb-3">
              <summary className="cursor-pointer text-resonance-accent hover:underline">📜 View Code Diff</summary>
              <pre className="mt-2 text-xs overflow-x-auto"><code>{`diff
- const userId = session.user.id;
+ const userId = session.user?.id;`}</code></pre>
            </details>
            <div className="border-t border-resonance-border pt-2 flex justify-between text-xs text-resonance-textMuted">
              <span>🧾 Compute Receipt: {cost}</span>
              <span>⏱️ Resolved in 4.2s</span>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-resonance-textMuted text-sm border-t border-resonance-border pt-6">
          <p>Resonance Core v0.1.0 — Built for Nebius × NVIDIA Global AI Hackathon</p>
          <p className="mt-1">Nemotron Nano → Tavily → Nemotron Ultra routing on Nebius AI Studio</p>
        </footer>
      </div>
    </div>
  );
}

function StatusCard({ title, value, icon: Icon, className, valueClassName }: {
  title: string;
  value: string;
  icon: LucideIcon;
  className: string;
  valueClassName: string;
}) {
  return (
    <div className={`${className} border rounded-xl p-4`}>
      <div className="text-xs text-resonance-textMuted uppercase tracking-wider mb-1">{title}</div>
      <div className="flex items-baseline gap-2">
        <Icon className={`${valueClassName}`} size={20} />
        <span className={`${valueClassName} text-xl font-mono font-medium`}>{value}</span>
      </div>
    </div>
  );
}

function StepRow({ step, index, isCompleted, isCurrent, isPending }: {
  step: Step;
  index: number;
  isCompleted: boolean;
  isCurrent: boolean;
  isPending: boolean;
}) {
  const Icon = step.icon;
  
  return (
    <div className="flex items-center gap-4 relative">
      {/* Connecting line */}
      {index > 0 && (
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-resonance-border" />
      )}
      
      {/* Step indicator */}
      <div className="relative flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300">
        {isCompleted ? (
          <CheckCircle className="w-6 h-6 text-resonance-success" />
        ) : isCurrent ? (
          <>
            <div className="w-8 h-8 rounded-full border-2 border-resonance-accent border-t-transparent animate-spin" />
            <div className="absolute inset-0 rounded-full bg-resonance-accent/20 animate-pulse" />
          </>
        ) : (
          <span className="text-resonance-textMuted font-mono text-sm">{index + 1}</span>
        )}
      </div>
      
      {/* Step content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${
            isCompleted ? "text-resonance-success" : 
            isCurrent ? "text-resonance-accent animate-glow" : 
            "text-resonance-textMuted"
          }`} />
          <div>
            <div className={`font-medium ${isCompleted || isCurrent ? "text-resonance-text" : "text-resonance-textMuted"}`}>
              {step.label}
            </div>
            <div className="text-xs text-resonance-textMuted">{step.description}</div>
          </div>
        </div>
        
        {/* Progress bar for current step */}
        {isCurrent && (
          <div className="mt-2 h-1 bg-resonance-border rounded-full overflow-hidden">
            <div className="h-full bg-resonance-accent animate-pulse" style={{ width: "60%" }} />
          </div>
        )}
      </div>
      
      {/* Status badge */}
      <div className="flex-shrink-0">
        {isCompleted && (
          <span className="px-2 py-1 text-xs font-medium bg-resonance-success/20 text-resonance-success rounded-full">
            Done
          </span>
        )}
        {isCurrent && (
          <span className="px-2 py-1 text-xs font-medium bg-resonance-accent/20 text-resonance-accent rounded-full animate-pulse">
            Active
          </span>
        )}
        {isPending && (
          <span className="px-2 py-1 text-xs font-medium bg-resonance-bg text-resonance-textMuted rounded-full">
            Pending
          </span>
        )}
      </div>
    </div>
  );
}