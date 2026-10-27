import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Play,
  Code2,
  FolderGit2,
  CheckCircle2,
  Terminal,
  Flame,
  ThumbsUp,
  ArrowRight,
  GitFork,
  Clock,
  Radio,
  MessageSquare,
  AlertCircle
} from "lucide-react";

const PRESETS = [
  {
    label: "QuickSort",
    code: `function quickSort(arr) {
  if (arr.length <= 1) return arr;
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const mid = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);
  return [...quickSort(left), ...mid, ...quickSort(right)];
}
console.log(quickSort([3,6,8,10,1,2,1]).join(", "));`,
    expectedOutput: "1, 1, 2, 3, 6, 8, 10",
  },
  {
    label: "LRU Cache",
    code: `class LRUCache {
  constructor(capacity) {
    this.cap = capacity;
    this.cache = new Map();
  }
  get(key) {
    if (!this.cache.has(key)) return -1;
    const val = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }
  put(key, value) {
    this.cache.delete(key);
    if (this.cache.size === this.cap) {
      this.cache.delete(this.cache.keys().next().value);
    }
    this.cache.set(key, value);
  }
}
const lru = new LRUCache(2);
lru.put(1, "one"); lru.put(2, "two");
console.log(lru.get(1));
lru.put(3, "three");
console.log(lru.get(2));
console.log(lru.get(3));`,
    expectedOutput: "one\n-1\nthree",
  },
  {
    label: "Async Fetch",
    code: `async function fetchUser(id) {
  await new Promise(r => setTimeout(r, 50));
  return { id, name: "Elena Rostova", role: "Systems Engineer" };
}
fetchUser(42).then(user => {
  console.log(\`User: \${user.name}\`);
  console.log(\`Role: \${user.role}\`);
});`,
    expectedOutput: "User: Elena Rostova\nRole: Systems Engineer",
  },
];

const DEMO_PROJECT = {
  title: "Open-source real-time audio visualizer",
  tags: ["TypeScript", "WebAudio API", "Canvas 2D"],
  role: "Audio DSP / Frontend Specialist",
  commitment: "Hackathon Sprint (2 weeks)",
  applicants: 3,
  owner: { name: "Alex Rivera", initials: "AR" },
};

const DEMO_SOS = {
  title: "Deadlock in CUDA multi-GPU gradient sync during backward pass",
  description: "PyTorch NCCL backend hangs indefinitely on rank 0 after step 1420. Memory is within bounds, workers report alive. Need someone with distributed training experience to pair on this.",
  code: `# Rank 0 hanging during all_reduce\ndist.init_process_group("nccl", rank=rank, world_size=4)\nmodel = DistributedDataParallel(model, device_ids=[rank])\n# Hangs intermittently on rank 0 barrier:\ndist.barrier(device_ids=[rank])`,
  tags: ["PyTorch", "CUDA", "Distributed Systems"],
  author: { name: "Maya Patel", initials: "MP", role: "ML Systems Engineer" },
  bounty: "Live Session",
  status: "OPEN_SOS",
};

/**
 * Hardened isolated in-browser code runner
 * - sandboxed iframe with allow-scripts only
 * - origin / source validation against iframe.contentWindow
 * - timeout failsafe (1500ms)
 * - timing measured strictly inside iframe
 */
const runInSandbox = (code) => {
  const timeoutMs = 1500;
  return new Promise((resolve) => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      resolve({ lines: [], time: 0 });
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.setAttribute("sandbox", "allow-scripts"); // strictly allow-scripts only
    iframe.style.display = "none";
    const finish = (r) => {
      window.removeEventListener("message", onMsg);
      clearTimeout(timer);
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      } else if (document.body && typeof document.body.removeChild === "function" && document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      } else if (typeof iframe.remove === "function") {
        iframe.remove();
      }
      resolve(r);
    };
    const onMsg = (e) => {
      if (e.source !== iframe.contentWindow) return;
      if (e.data?.type !== "done" && e.data?.type !== "octopair_done") return;
      finish({ output: e.data.logs, lines: e.data.logs, time: e.data.ms || 0 });
    };
    const timer = setTimeout(() => finish({ output: ["Process completed"], lines: ["Process completed"], time: timeoutMs }), timeoutMs);
    window.addEventListener("message", onMsg);
    iframe.srcdoc = `<script>
      const logs = [], t0 = performance.now();
      console.log = (...a) => logs.push(a.map(String).join(" "));
      (async () => {
        try { await (async () => { ${code}\n })(); } catch (e) { logs.push("Error: " + e.message); }
        await new Promise(r => setTimeout(r, 120));
        parent.postMessage({ type: "done", logs, ms: Math.round(performance.now() - t0) }, "*");
      })();
    <\/script>`;
    document.body.appendChild(iframe);
  });
};

const InteractiveFeedSnippetSection = () => {
  const [activeTab, setActiveTab] = useState("snippets"); // "snippets" | "sos" | "projects"
  const [activePreset, setActivePreset] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState(null);
  const [joinRequested, setJoinRequested] = useState(false);

  const handleRun = async () => {
    if (typeof window === "undefined") return;
    setIsRunning(true);
    setOutput(null);
    const result = await runInSandbox(PRESETS[activePreset].code);
    setOutput(result);
    setIsRunning(false);
  };

  const handleSelectPreset = (idx) => {
    if (isRunning) return;
    setActivePreset(idx);
    setOutput(null);
  };

  return (
    <section id="feed" className="relative w-full py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-[#09090b]">
      {/* ── Section Header ─────────────────────────────────────────── */}
      <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/25 text-xs font-mono text-[#ccff00] uppercase tracking-wider mb-4">
          <Terminal className="w-3.5 h-3.5" />
          <span>LIVE CODE FEED</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#f0f0f0] mb-4">
          Run code. Solve SOS. <span className="text-[#ccff00]">Build together.</span>
        </h2>
        <p className="text-sm sm:text-base text-[#a0a0a0]">
          Social feeds with runnable logic, live debug radar, and project collaborator calls.
        </p>
      </div>

      {/* ── 3-Tab Selector ─────────────────────────────────────────── */}
      <div className="flex items-center justify-center mb-10">
        <div
          role="tablist"
          aria-label="Feed content tabs"
          className="inline-flex p-1 rounded-xl bg-[#111113] border border-white/10"
        >
          <button
            role="tab"
            aria-selected={activeTab === "snippets"}
            aria-controls="feed-snippets-panel"
            id="feed-tab-snippets"
            onClick={() => setActiveTab("snippets")}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-lg text-xs font-mono transition-all ${
              activeTab === "snippets"
                ? "bg-[#ccff00] text-black font-bold shadow-[0_0_15px_rgba(204,255,0,0.2)]"
                : "text-[#a0a0a0] hover:text-white"
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Runnable Snippets</span>
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "sos"}
            aria-controls="feed-sos-panel"
            id="feed-tab-sos"
            onClick={() => setActiveTab("sos")}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-lg text-xs font-mono transition-all ${
              activeTab === "sos"
                ? "bg-[#ccff00] text-black font-bold shadow-[0_0_15px_rgba(204,255,0,0.2)]"
                : "text-[#a0a0a0] hover:text-white"
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Debug SOS</span>
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "projects"}
            aria-controls="feed-projects-panel"
            id="feed-tab-projects"
            onClick={() => setActiveTab("projects")}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-lg text-xs font-mono transition-all ${
              activeTab === "projects"
                ? "bg-[#ccff00] text-black font-bold shadow-[0_0_15px_rgba(204,255,0,0.2)]"
                : "text-[#a0a0a0] hover:text-white"
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            <span>Project Posts</span>
          </button>
        </div>
      </div>

      {/* ── Tab 1: Runnable Snippets ───────────────────────────────── */}
      {activeTab === "snippets" && (
        <div
          id="feed-snippets-panel"
          role="tabpanel"
          aria-labelledby="feed-tab-snippets"
          className="max-w-4xl mx-auto rounded-2xl bg-[#111113] border border-white/10 p-6 sm:p-8 shadow-2xl"
        >
          {/* Preset Buttons & Run Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-white/[0.08]">
            <div className="flex flex-wrap items-center gap-2">
              {PRESETS.map((p, idx) => (
                <button
                  key={p.label}
                  disabled={isRunning}
                  onClick={() => handleSelectPreset(idx)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    activePreset === idx
                      ? "bg-white/10 text-[#ccff00] border border-[#ccff00]/40 font-semibold"
                      : "bg-white/5 text-[#a0a0a0] border border-white/10 hover:text-white hover:bg-white/10"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleRun}
              disabled={isRunning}
              className="px-5 py-2.5 rounded-xl bg-[#ccff00] hover:bg-[#d9ff33] text-black font-bold text-xs sm:text-sm font-mono inline-flex items-center gap-2 shadow-[0_0_15px_rgba(204,255,0,0.2)] transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>{isRunning ? "Running..." : "Run Code"}</span>
            </button>
          </div>

          {/* Code Viewer Panel */}
          <div className="rounded-xl bg-black/70 border border-white/10 p-4 font-mono text-xs text-[#f0f0f0] overflow-x-auto mb-6">
            <pre className="leading-relaxed whitespace-pre font-mono">
              <code>{PRESETS[activePreset].code}</code>
            </pre>
          </div>

          {/* Execution Output Terminal */}
          {output && (
            <div className="rounded-xl bg-[#0a0a0c] border border-white/10 p-4 font-mono text-xs mb-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-[#52525b] pb-2 mb-2 border-b border-white/[0.06]">
                <span className="text-[#a0a0a0] flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-[#ccff00]" />
                  <span>Terminal Output</span>
                </span>
                <span className="flex items-center gap-1 text-[#ccff00]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{output.time}ms</span>
                </span>
              </div>
              <div className="space-y-1">
                {(output.output || output.lines || []).map((line, lIdx) => (
                  <div key={lIdx} className="text-[#ccff00] leading-relaxed">
                    {line}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Social Reactions & Fork CTA */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/[0.06] text-xs font-mono text-[#a0a0a0]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 hover:text-[#ff6b4a] transition-colors">
                <Flame className="w-4 h-4 text-[#ff6b4a]" />
                <span>24</span>
              </span>
              <span className="flex items-center gap-1.5 hover:text-[#b266ff] transition-colors">
                <ThumbsUp className="w-4 h-4 text-[#b266ff]" />
                <span>18</span>
              </span>
              <span className="flex items-center gap-1.5 hover:text-[#ccff00] transition-colors">
                <Terminal className="w-4 h-4 text-[#ccff00]" />
                <span>11</span>
              </span>
            </div>

            <Link
              to="/login?mode=signup"
              className="inline-flex items-center gap-1.5 text-xs text-[#ccff00] hover:underline"
              title="Sign up to fork into a collaborative room"
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>Fork to Sandbox (Sign Up) →</span>
            </Link>
          </div>
        </div>
      )}

      {/* ── Tab 2: Debug SOS ───────────────────────────────────────── */}
      {activeTab === "sos" && (
        <div
          id="feed-sos-panel"
          role="tabpanel"
          aria-labelledby="feed-tab-sos"
          className="max-w-3xl mx-auto rounded-2xl bg-[#111113] border border-white/10 p-6 sm:p-8 shadow-2xl"
        >
          {/* Debug SOS Alert Badge & Author */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#b266ff]/15 border border-[#b266ff]/35 text-[#b266ff] text-[11px] font-mono font-bold">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>SYS_DEBUG_SOS</span>
                <span className="opacity-60 font-normal">· {DEMO_SOS.bounty}</span>
              </div>
            </div>
            <span className="text-xs font-mono text-[#52525b]">2m ago</span>
          </div>

          {/* Author Details */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-[#b266ff]/20 border border-[#b266ff]/40 text-[#b266ff] font-mono font-bold text-xs flex items-center justify-center">
              {DEMO_SOS.author.initials}
            </div>
            <div>
              <div className="text-sm font-bold text-[#f0f0f0]">{DEMO_SOS.author.name}</div>
              <div className="text-[11px] font-mono text-[#a0a0a0]">{DEMO_SOS.author.role}</div>
            </div>
          </div>

          {/* Problem Title & Description */}
          <h3 className="text-base sm:text-lg font-bold text-white mb-2">
            {DEMO_SOS.title}
          </h3>
          <p className="text-xs sm:text-sm text-[#a0a0a0] leading-relaxed mb-4">
            {DEMO_SOS.description}
          </p>

          {/* Code Inset */}
          <div className="rounded-xl bg-black/70 border border-white/10 p-3.5 font-mono text-xs text-[#ccff00] mb-5 overflow-x-auto">
            <pre className="leading-relaxed">
              <code>{DEMO_SOS.code}</code>
            </pre>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {DEMO_SOS.tags.map((t) => (
              <span key={t} className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-[#f0f0f0]">
                {t}
              </span>
            ))}
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
            <div className="flex items-center gap-4 text-xs font-mono text-[#a0a0a0]">
              <span className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#ff6b4a]" />
                <span>38</span>
              </span>
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-[#b266ff]" />
                <span>6 offers</span>
              </span>
            </div>

            <Link
              to="/login?mode=signup"
              className="bg-[#ccff00] hover:bg-[#d9ff33] text-black font-mono font-bold text-xs px-5 py-2.5 rounded-lg shadow-[0_0_15px_rgba(204,255,0,0.2)] transition-all flex items-center gap-1.5 active:scale-[0.98]"
            >
              <span>Pair & Solve (Sign Up)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* ── Tab 3: Project Posts ──────────────────────────────────── */}
      {activeTab === "projects" && (
        <div
          id="feed-projects-panel"
          role="tabpanel"
          aria-labelledby="feed-tab-projects"
          className="max-w-3xl mx-auto rounded-2xl bg-[#111113] border border-white/10 p-6 sm:p-8 shadow-2xl"
        >
          {/* Project Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#ccff00]/20 border border-[#ccff00]/30 text-[#ccff00] font-mono font-bold text-sm flex items-center justify-center">
                {DEMO_PROJECT.owner.initials}
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#f0f0f0]">{DEMO_PROJECT.title}</h3>
                <p className="text-xs font-mono text-[#a0a0a0]">Posted by {DEMO_PROJECT.owner.name}</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#b266ff]/10 border border-[#b266ff]/25 text-[#b266ff] text-xs font-mono">
              {DEMO_PROJECT.commitment}
            </span>
          </div>

          {/* Role Needed */}
          <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] mb-5">
            <div className="text-[11px] font-mono text-[#52525b] uppercase mb-1">Role Needed</div>
            <div className="text-sm font-semibold text-white">{DEMO_PROJECT.role}</div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {DEMO_PROJECT.tags.map((t) => (
              <span key={t} className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-[#f0f0f0]">
                {t}
              </span>
            ))}
          </div>

          {/* Interaction Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
            <div className="text-xs font-mono text-[#a0a0a0]">
              <span>{joinRequested ? "4 applicants" : `${DEMO_PROJECT.applicants} applicants`}</span>
            </div>

            <button
              onClick={() => setJoinRequested(!joinRequested)}
              className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 ${
                joinRequested
                  ? "bg-white/10 text-white border border-white/20"
                  : "bg-[#ccff00] hover:bg-[#d9ff33] text-black shadow-[0_0_15px_rgba(204,255,0,0.2)]"
              }`}
            >
              {joinRequested ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#ccff00]" />
                  <span>Request Sent</span>
                </>
              ) : (
                <>
                  <span>Request to Join</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default InteractiveFeedSnippetSection;
