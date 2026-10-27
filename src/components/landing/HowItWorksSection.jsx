import React, { useState } from "react";
import { FolderGit2, Users, Terminal, CheckCircle2, ArrowRight } from "lucide-react";

/**
 * Feature F19: How It Works Section
 * 
 * - id="how-it-works"
 * - 4-step story cards synchronized with sticky navigator:
 *   - Step 1: "Pick a Project"
 *   - Step 2: "Match in Seconds"
 *   - Step 3: "Pair Live"
 *   - Step 4: "Ship & Prove"
 */
const HowItWorksSection = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      number: "01",
      stepLabel: "Step 1",
      title: "Pick a Project",
      icon: FolderGit2,
      subtitle: "Filter active repositories by stack and stage",
      description:
        "Browse the curated project graph or post your own repository. Filter by languages like TypeScript, Go, or Rust, select roles needed (Backend, Systems, UI), and view project scope before connecting.",
      codeSnippet: `// 1. Select repository target
const project = await octopair.projects.find({
  stack: ["TypeScript", "WebRTC", "Rust"],
  roleNeeded: "Systems Engineer",
  commitment: "Hackathon Sprint"
});`,
      accent: "#ccff00",
    },
    {
      number: "02",
      stepLabel: "Step 2",
      title: "Match in Seconds",
      icon: Users,
      subtitle: "Instant peer pairing without scheduling friction",
      description:
        "Our low-latency matchmaking engine matches you with vetted peers who are online right now. Review collaborator stack history, past verified solves, and accept with one click.",
      codeSnippet: `// 2. Peer handshake initiated
const session = await octopair.match({
  peer: "elena_core",
  latencyTargetMs: 35,
  iceTransport: "all-turn-stun"
});`,
      accent: "#b266ff",
    },
    {
      number: "03",
      stepLabel: "Step 3",
      title: "Pair Live",
      icon: Terminal,
      subtitle: "Zero-latency in-browser collaborative editor",
      description:
        "Jump directly into an interactive editor room with sub-50ms peer operational transform, multiplayer cursors, shared cloud terminal shell, and synchronized port forwarding. No local tools to configure.",
      codeSnippet: `// 3. Operational transform synchronizing
room.on("peerCursor", (cursor) => renderPointer(cursor));
room.terminal.spawn("pnpm run dev --port 3000");
// Live WebRTC stream connected: 60 FPS`,
      accent: "#ccff00",
    },
    {
      number: "04",
      stepLabel: "Step 4",
      title: "Ship & Prove",
      icon: CheckCircle2,
      subtitle: "Verified git co-authorship for every contributor",
      description:
        "Once your pull request is merged, OctoPair signs verified Co-authored-by git attribution into commits. Build an unshakeable proof-of-work timeline that stands alongside your GitHub profile.",
      codeSnippet: `// 4. Cryptographic Proof of Work
git.commit({
  message: "feat: implement WebRTC operational transform",
  coAuthors: ["alex@octopair.dev", "elena@octopair.dev"],
  signature: "OP-VERIFIED-POW-9941"
});`,
      accent: "#f0f0f0",
    },
  ];

  return (
    <section id="how-it-works" className="relative w-full py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-[#09090b]">
      {/* ── Section Header ─────────────────────────────────────────── */}
      <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/20 text-xs font-mono text-[#ccff00] uppercase tracking-wider mb-4">
          <span>Workflow Execution</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#f0f0f0] mb-4">
          How <span className="text-[#ccff00]">OctoPair</span> Works
        </h2>
        <p className="text-sm sm:text-base text-[#a0a0a0]">
          From project discovery to verified git commit attribution in 4 streamlined steps.
        </p>
      </div>

      {/* ── Synchronized Navigator & Story Cards ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Sticky Left Navigator */}
        <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-3">
          <div className="p-4 rounded-2xl bg-[#111113] border border-white/10">
            <p className="text-[11px] font-mono uppercase tracking-widest text-[#52525b] mb-4 px-2">
              Step Navigator
            </p>
            <div className="space-y-2">
              {steps.map((step, idx) => {
                const isActive = activeStep === idx;
                const isPurple = step.accent === "#b266ff";
                return (
                  <button
                    key={step.title}
                    type="button"
                    onClick={() => setActiveStep(idx)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl text-left transition-all duration-200 border ${
                      isActive
                        ? isPurple
                          ? "bg-[#b266ff]/10 border-[#b266ff]/40 text-[#f0f0f0]"
                          : "bg-[#ccff00]/10 border-[#ccff00]/40 text-[#f0f0f0]"
                        : "bg-transparent border-transparent text-[#a0a0a0] hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                          isActive
                            ? isPurple
                              ? "bg-[#b266ff] text-black"
                              : "bg-[#ccff00] text-black"
                            : "bg-white/5 text-[#52525b]"
                        }`}
                      >
                        {step.number}
                      </div>
                      <div>
                        <div className="text-xs font-bold">{step.title}</div>
                        <div className="text-[10px] font-mono text-[#52525b]">
                          {step.stepLabel}
                        </div>
                      </div>
                    </div>
                    {isActive && (
                      <ArrowRight className={`w-4 h-4 ${isPurple ? "text-[#b266ff]" : "text-[#ccff00]"}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Scrolling Story Cards */}
        <div className="lg:col-span-8 space-y-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isSelected = activeStep === idx;
            const isPurple = step.accent === "#b266ff";
            return (
              <div
                key={step.title}
                onMouseEnter={() => setActiveStep(idx)}
                className={`p-7 sm:p-9 rounded-2xl bg-[#111113] border transition-all duration-300 shadow-xl ${
                  isSelected
                    ? isPurple
                      ? "border-[#b266ff]/40 ring-1 ring-[#b266ff]/20"
                      : "border-[#ccff00]/40 ring-1 ring-[#ccff00]/20"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${isPurple ? "text-[#b266ff]" : "text-[#ccff00]"}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className={`text-[11px] font-mono uppercase tracking-wider ${isPurple ? "text-[#b266ff]" : "text-[#ccff00]"}`}>
                        {step.stepLabel}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#f0f0f0]">
                        {step.title}
                      </h3>
                    </div>
                  </div>
                  <span className="font-mono text-3xl font-extrabold text-[#52525b]">
                    {step.number}
                  </span>
                </div>

                <p className="text-xs font-mono text-[#a0a0a0] mb-3">
                  {step.subtitle}
                </p>
                <p className="text-sm text-[#d4d4d8] leading-relaxed mb-6">
                  {step.description}
                </p>

                {/* Technical Code Preview Inset */}
                <div className="rounded-xl bg-black/60 border border-white/10 p-4 font-mono text-xs overflow-x-auto text-[#a0a0a0]">
                  <div className="flex items-center gap-1.5 mb-2.5 pb-2 border-b border-white/[0.06]">
                    <span className="w-2 h-2 rounded-full bg-red-500/80" />
                    <span className="w-2 h-2 rounded-full bg-yellow-500/80" />
                    <span className="w-2 h-2 rounded-full bg-green-500/80" />
                    <span className="ml-2 text-[10px] text-[#52525b]">
                      terminal_preview.ts
                    </span>
                  </div>
                  <pre className="text-[11px] leading-relaxed text-[#f0f0f0]">
                    <code>{step.codeSnippet}</code>
                  </pre>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
