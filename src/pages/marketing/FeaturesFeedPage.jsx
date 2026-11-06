import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Code2,
  ArrowRight,
  ArrowLeft,
  Radio,
  Play,
  RotateCcw,
  Terminal,
  Clock,
  Flame,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  GitFork
} from "lucide-react";

import InteractiveFeedSnippetSection from "../../components/landing/InteractiveFeedSnippetSection";
import FinalCtaSection from "../../components/landing/FinalCtaSection";

/**
 * Hardened isolated sandbox runner for hero snippet execution
 */
const runHeroSandbox = (code) => {
  const timeoutMs = 1500;
  return new Promise((resolve) => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      resolve({ lines: ["Sandboxed execution completed (SSR fallback)"], time: 8 });
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.setAttribute("sandbox", "allow-scripts");
    iframe.style.display = "none";

    const finish = (res) => {
      window.removeEventListener("message", onMsg);
      clearTimeout(timer);
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      } else if (document.body && typeof document.body.removeChild === "function" && document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      } else if (typeof iframe.remove === "function") {
        iframe.remove();
      }
      resolve(res);
    };

    const onMsg = (e) => {
      if (e.source !== iframe.contentWindow) return;
      if (e.data?.type !== "done" && e.data?.type !== "octopair_done") return;
      finish({ lines: e.data.logs || [], time: e.data.ms || 0 });
    };

    const timer = setTimeout(() => {
      finish({ lines: ["Process completed (1500ms timeout)"], time: timeoutMs });
    }, timeoutMs);

    window.addEventListener("message", onMsg);
    iframe.srcdoc = `<script>
      const logs = [], t0 = performance.now();
      console.log = (...a) => logs.push(a.map(String).join(" "));
      (async () => {
        try {
          await (async () => { ${code} })();
        } catch (err) {
          logs.push("Runtime Error: " + err.message);
        }
        await new Promise((r) => setTimeout(r, 60));
        parent.postMessage({ type: "done", logs, ms: Math.max(1, Math.round(performance.now() - t0)) }, "*");
      })();
    <\/script>`;

    document.body.appendChild(iframe);
  });
};

const HERO_DEFAULT_CODE = `// Live NCCL Barrier Sync Probe
const ranks = [0, 1, 2, 3];
console.log("Probing NCCL cluster status...");
ranks.forEach(r => console.log(\`ok Node rank \${r}: alive, mem \${(14.2 + r * 0.4).toFixed(1)}GB/16GB\`));
console.log("ALERT: Rank 0 hanging on collective barrier at step 1420");
console.log("DIAGNOSIS: Deadlock in backward pass gradient all_reduce");`;

/**
 * FeaturesFeedPage (/features/feed)
 *
 * Dedicated marketing sub-page for Interactive Code Feed & Real-Time Debug SOS.
 * Visual Archetype: Problem Radar
 * Features:
 * - 2-Column Split Hero with AnimMaster Radar Pulse Beacon Card
 * - Glowing Vengeance border beam and concentric emergency ping rings
 * - Instant in-browser runnable code runner with sandboxed execution output
 * - Semantic h1 heading hierarchy
 * - InteractiveFeedSnippetSection downstream deep dive
 * - Inter-feature CTA link to /features/projects
 * - Closing signup CTA banner routing to /login?mode=signup
 */
const FeaturesFeedPage = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState({
    lines: [
      "Probing NCCL cluster status...",
      "ok Node rank 0: alive, mem 14.2GB/16GB",
      "ok Node rank 1: alive, mem 14.6GB/16GB",
      "ok Node rank 2: alive, mem 15.0GB/16GB",
      "ok Node rank 3: alive, mem 15.4GB/16GB",
      "ALERT: Rank 0 hanging on collective barrier at step 1420",
      "DIAGNOSIS: Deadlock in backward pass gradient all_reduce",
    ],
    time: 14,
  });

  const handleRunVerification = async () => {
    setIsRunning(true);
    const result = await runHeroSandbox(HERO_DEFAULT_CODE);
    setOutput(result);
    setIsRunning(false);
  };

  const handleReset = () => {
    setOutput(null);
  };

  return (
    <div className="w-full bg-[#09090b] text-[#f0f0f0] overflow-x-clip">
      {/* ── Problem Radar Split Visual Hero ─────────────────────────── */}
      <section className="relative w-full pt-16 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Ambient Top Glows */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-1/4 -translate-x-1/2 w-[650px] max-w-full h-[320px] bg-[#ccff00]/[0.07] blur-[140px] pointer-events-none rounded-full"
        />
        <div
          aria-hidden="true"
          className="absolute top-20 right-1/4 w-[450px] h-[300px] bg-[#b266ff]/[0.06] blur-[130px] pointer-events-none rounded-full"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* ── Left Column: Headline & Action Triggers ────────────── */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            {/* Breadcrumb / Back Link */}
            <div className="mb-6">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-xs font-mono text-[#a0a0a0] hover:text-[#f0f0f0] transition-colors px-3 py-1.5 rounded-full bg-white/5 border border-white/10"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Overview</span>
              </Link>
            </div>

            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/25 text-xs font-mono text-[#ccff00] uppercase tracking-wider mb-6">
              <Code2 className="w-3.5 h-3.5" />
              <span>SOCIAL CODE FEED</span>
            </div>

            {/* Primary Semantic Title (h1) */}
            <h1 className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-[#f0f0f0] mb-6 leading-[1.1]">
              Interactive Code Feed &amp;{" "}
              <span className="bg-gradient-to-r from-[#ccff00] via-[#ffffff] to-[#b266ff] bg-clip-text text-transparent">
                Debug SOS
              </span>
            </h1>

            {/* Descriptive Subtitle */}
            <p className="text-base sm:text-lg text-[#a0a0a0] max-w-xl leading-relaxed mb-8 font-normal">
              Run code directly in-browser, post live technical questions with context, and respond to real-time Debug SOS broadcasts.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-8">
              <Link
                to="/login?mode=signup"
                className="w-full sm:w-auto bg-[#ccff00] hover:bg-[#d9ff33] text-black font-bold font-mono text-sm px-6 py-3.5 rounded-xl transition-all duration-200 inline-flex items-center justify-center gap-2 group shadow-[0_0_25px_rgba(204,255,0,0.25)]"
              >
                <span>Start Pairing Free</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/features/projects"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-[#f0f0f0] transition-colors inline-flex items-center justify-center gap-2"
              >
                <span>Explore Open Projects</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Live Telemetry Tickers */}
            <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-white/[0.08] w-full text-xs font-mono text-[#a0a0a0]">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                <span className="h-2 w-2 rounded-full bg-[#ccff00] animate-pulse" />
                <span>Live Radar: 14 Active SOS Beacons</span>
              </div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                <Clock className="w-3 h-3 text-[#b266ff]" />
                <span>Sandbox Latency: &lt;14ms</span>
              </div>
            </div>
          </div>

          {/* ── Right Column: AnimMaster Radar Pulse Beacon Card ────── */}
          <div className="lg:col-span-6 w-full">
            <div className="relative rounded-2xl overflow-hidden p-[1px] shadow-[0_0_50px_rgba(204,255,0,0.12)] border border-white/10 hover:border-white/20 transition-all group">
              {/* Vengeance Rotating Conic Glowing Border Beam */}
              <div
                aria-hidden="true"
                className="absolute -inset-[150%] bg-[conic-gradient(from_0deg,transparent_0_310deg,#ccff00_340deg,#b266ff_360deg)] animate-[spin_8s_linear_infinite] motion-reduce:hidden pointer-events-none"
              />

              {/* Inner Card Container */}
              <div className="relative rounded-2xl bg-[#111113] p-5 sm:p-7 z-10 flex flex-col justify-between">
                {/* 1. Radar Beacon Header */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
                  <div className="flex items-center gap-3">
                    {/* Concentric Emergency Radar Pulse Rings */}
                    <div className="relative flex items-center justify-center w-10 h-10 shrink-0">
                      <span className="animate-ping absolute inline-flex h-10 w-10 rounded-full bg-red-500/25 duration-1000" />
                      <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-red-500/40 duration-1000 delay-300" />
                      <span className="relative inline-flex items-center justify-center rounded-full h-4 w-4 bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]">
                        <Radio className="w-2.5 h-2.5 text-white animate-pulse" />
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded uppercase tracking-wider">
                          DEBUG SOS // PRIORITY_1
                        </span>
                        <span className="text-[11px] font-mono text-[#a0a0a0]">2m ago</span>
                      </div>
                      <div className="text-xs font-mono text-[#f0f0f0] font-medium mt-0.5">
                        Maya Patel · ML Systems Engineer
                      </div>
                    </div>
                  </div>

                  <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/25 text-[10px] font-mono text-[#ccff00] font-bold">
                    <Sparkles className="w-3 h-3" />
                    <span>Live Pairing</span>
                  </span>
                </div>

                {/* 2. SOS Problem Summary */}
                <div className="mb-4">
                  <h3 className="text-base sm:text-lg font-bold text-[#f0f0f0] mb-1">
                    CUDA Multi-GPU Deadlock on Barrier Sync
                  </h3>
                  <p className="text-xs text-[#a0a0a0] leading-relaxed">
                    PyTorch NCCL backend hangs indefinitely on rank 0 barrier after step 1420. Workers report alive.
                  </p>
                </div>

                {/* 3. In-Browser Runnable Code Editor */}
                <div className="rounded-xl bg-black/80 border border-white/10 p-3.5 font-mono text-xs text-[#ccff00] mb-3 overflow-x-auto relative">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.08] text-[11px] text-[#a0a0a0]">
                    <span className="flex items-center gap-1.5 font-mono">
                      <Terminal className="w-3.5 h-3.5 text-[#ccff00]" />
                      <span>nccl_barrier_probe.js</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                      title="Reset output"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  </div>
                  <pre className="leading-relaxed whitespace-pre font-mono text-[11px]">
                    <code>{HERO_DEFAULT_CODE}</code>
                  </pre>
                </div>

                {/* 4. Action Trigger & Live Terminal Output */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handleRunVerification}
                      disabled={isRunning}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-[#ccff00] hover:bg-[#d9ff33] text-black font-mono font-bold text-xs inline-flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(204,255,0,0.2)] transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-black" />
                      <span>{isRunning ? "Verifying Cluster..." : "Run In-Browser Probe"}</span>
                    </button>

                    <Link
                      to="/login?mode=signup"
                      className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-mono font-semibold text-[#f0f0f0] inline-flex items-center gap-1.5 transition-all shrink-0"
                    >
                      <GitFork className="w-3.5 h-3.5 text-[#ccff00]" />
                      <span>Pair on SOS</span>
                    </Link>
                  </div>

                  {output && (
                    <div className="rounded-xl bg-[#0a0a0c] border border-white/10 p-3 font-mono text-[11px]">
                      <div className="flex items-center justify-between text-[#a0a0a0] pb-1.5 mb-1.5 border-b border-white/[0.06]">
                        <span className="flex items-center gap-1 text-[#ccff00]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Sandboxed Output</span>
                        </span>
                        <span className="flex items-center gap-1 text-[#b266ff]">
                          <Clock className="w-3 h-3" />
                          <span>{output.time}ms</span>
                        </span>
                      </div>
                      <div className="space-y-0.5 text-xs">
                        {(output.lines || []).map((line, idx) => (
                          <div
                            key={idx}
                            className={
                              line.startsWith("ALERT")
                                ? "text-red-400 font-bold"
                                : line.startsWith("DIAGNOSIS")
                                ? "text-[#b266ff] font-semibold"
                                : "text-[#ccff00]"
                            }
                          >
                            {line}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. Live Community Reactions */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/[0.08] text-xs font-mono text-[#a0a0a0]">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 hover:text-[#ff6b4a] transition-colors">
                      <Flame className="w-3.5 h-3.5 text-[#ff6b4a]" />
                      <span>42 upvotes</span>
                    </span>
                    <span className="flex items-center gap-1.5 hover:text-[#b266ff] transition-colors">
                      <MessageSquare className="w-3.5 h-3.5 text-[#b266ff]" />
                      <span>8 offers</span>
                    </span>
                  </div>
                  <span className="text-[11px] text-[#ccff00] font-mono">
                    3 domain engineers tuned in
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Assembled Landing Sections ─────────────────────────────── */}
      <InteractiveFeedSnippetSection />

      {/* ── Inter-Feature Navigation CTA ───────────────────────────── */}
      <section className="relative w-full py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="p-6 sm:p-8 rounded-2xl bg-[#111113] border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <span className="text-[11px] font-mono text-[#a0a0a0] uppercase tracking-wider block mb-1">
              Next Capability
            </span>
            <h3 className="text-xl font-bold text-[#f0f0f0]">
              Open Developer Projects &amp; Sprints
            </h3>
            <p className="text-xs text-[#a0a0a0] mt-1">
              Curated open-source codebases, active team sprints, and role-based pairing opportunities.
            </p>
          </div>
          <Link
            to="/features/projects"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-mono font-semibold text-[#f0f0f0] border border-white/15 transition-all group shrink-0"
          >
            <span>Explore Open Projects</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* ── Closing Banner CTA ─────────────────────────────────────── */}
      <FinalCtaSection />
    </div>
  );
};

export default FeaturesFeedPage;
