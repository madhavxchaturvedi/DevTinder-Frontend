import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Terminal, Code2, FolderGit2, ArrowRight, Check, Layers } from "lucide-react";

/**
 * FeatureTeasersSection
 *
 * Interactive 4-card preview grid on root `/` directing visitors to dedicated sub-pages:
 * 1. Swipe & Match (/features/match) - Sparkles, Purple #b266ff, "98% Match" compatibility preview
 * 2. Live Multiplayer Room (/features/collab) - Terminal, Lime #ccff00, Sub-50ms P2P IDE preview
 * 3. Developer Feed (/features/feed) - Code2, Lime #ccff00, Sandboxed runtime & Debug SOS preview
 * 4. Open Projects (/features/projects) - FolderGit2, Purple #b266ff, Repository showcase & sprint preview
 *
 * Design constraints:
 * - Surface: #111113, hairline borders: border-white/10
 * - Hover elevation: hover:-translate-y-2 duration-300
 * - Zero emojis (Lucide icons only)
 * - Zero Redux dependencies (pure presentation / router links)
 * - Zero h1 tags (section header uses semantic <h2>, cards use <h3>)
 * - Zero forbidden routes (/discover, /sandbox, /profile/:id)
 */
const FeatureTeasersSection = () => {
  return (
    <section className="relative w-full py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* ── Section Header ─────────────────────────────────────────── */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/25 text-xs font-mono text-[#ccff00] uppercase tracking-wider mb-4">
          <Layers className="w-3.5 h-3.5" />
          <span>PLATFORM CAPABILITIES</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#f0f0f0] mb-4">
          Everything you need to ship, live
        </h2>
        <p className="text-base sm:text-lg text-[#a0a0a0] leading-relaxed">
          Four integrated pillars engineered specifically for developers to find peers, collaborate in real time, and ship verified software together.
        </p>
      </div>

      {/* ── 4-Card Interactive Teaser Grid ─────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {/* ── Card 1: Swipe & Match (/features/match) ──────────────── */}
        <div className="group relative flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-[#111113] border border-white/10 hover:border-[#b266ff]/40 hover:-translate-y-2 transition-all duration-300 shadow-xl">
          <div>
            {/* Top Row: Icon & Capability Badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#b266ff]/10 border border-[#b266ff]/20 flex items-center justify-center text-[#b266ff]">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-[#b266ff]/10 border border-[#b266ff]/25 text-[#b266ff] font-semibold">
                SWIPE &amp; MATCH
              </span>
            </div>

            {/* Title & Description */}
            <h3 className="text-xl sm:text-2xl font-bold text-[#f0f0f0] mb-2 group-hover:text-white transition-colors">
              Developer Discovery &amp; Matching
            </h3>
            <p className="text-sm text-[#a0a0a0] leading-relaxed mb-6">
              Algorithmic developer pairing scored by verified tech stack overlap, proof of work, and real-time collaboration telemetry.
            </p>

            {/* Interactive Preview: Compatibility Meter */}
            <div className="bg-[#09090b]/80 rounded-xl border border-white/10 p-4 mb-6 font-mono text-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-[#a0a0a0]">
                  <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
                  <span>Compatibility Score</span>
                </div>
                <span className="text-[#ccff00] font-bold text-sm">98% Match</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden p-0.5 border border-white/5 mb-3">
                <div className="h-full rounded-full bg-gradient-to-r from-[#b266ff] via-[#d980fa] to-[#ccff00] w-[98%] transition-all duration-500" />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#71717a] pt-2 border-t border-white/5">
                <span>Alex S. ⇄ Elena R.</span>
                <span className="text-[#a0a0a0]">TypeScript + Rust + WebRTC</span>
              </div>
            </div>
          </div>

          {/* Action Link Button */}
          <Link
            to="/features/match"
            className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#b266ff] hover:text-[#d980fa] transition-colors pt-2 group-hover:translate-x-1 duration-200"
          >
            <span>Explore Matching →</span>
          </Link>
        </div>

        {/* ── Card 2: Live Multiplayer Room (/features/collab) ───────── */}
        <div className="group relative flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-[#111113] border border-white/10 hover:border-[#ccff00]/40 hover:-translate-y-2 transition-all duration-300 shadow-xl">
          <div>
            {/* Top Row: Icon & Capability Badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/20 flex items-center justify-center text-[#ccff00]">
                <Terminal className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-[#ccff00]/10 border border-[#ccff00]/25 text-[#ccff00] font-semibold">
                MULTIPLAYER IDE
              </span>
            </div>

            {/* Title & Description */}
            <h3 className="text-xl sm:text-2xl font-bold text-[#f0f0f0] mb-2 group-hover:text-white transition-colors">
              Sub-50ms Live Collaboration
            </h3>
            <p className="text-sm text-[#a0a0a0] leading-relaxed mb-6">
              In-browser multiplayer IDE with WebRTC audio/video mesh, cloud terminals, synchronized editor state, and zero latency lag.
            </p>

            {/* Interactive Preview: Scripted IDE & Mesh Latency */}
            <div className="bg-[#09090b]/80 rounded-xl border border-white/10 p-4 mb-6 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                  <span className="text-[#71717a] ml-2">peer_sync.ts</span>
                </div>
                <div className="flex items-center gap-2 text-[#ccff00] text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-pulse" />
                  <span>18ms P2P Mesh</span>
                </div>
              </div>
              <div className="space-y-1 text-[11px] text-[#a0a0a0]">
                <div>
                  <span className="text-[#b266ff]">const</span>{" "}
                  <span className="text-[#f0f0f0]">mesh</span> ={" "}
                  <span className="text-[#b266ff]">await</span>{" "}
                  <span className="text-[#ccff00]">connectP2P</span>();
                </div>
                <div>
                  <span className="text-[#f0f0f0]">mesh</span>.
                  <span className="text-[#ccff00]">syncEditorDeltas</span>({" "}
                  <span className="text-[#71717a]">&#47;* sub-50ms sync *&#47;</span>{" "}
                  );
                </div>
              </div>
            </div>
          </div>

          {/* Action Link Button */}
          <Link
            to="/features/collab"
            className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#ccff00] hover:text-[#d9ff33] transition-colors pt-2 group-hover:translate-x-1 duration-200"
          >
            <span>Explore Collaboration →</span>
          </Link>
        </div>

        {/* ── Card 3: Developer Feed (/features/feed) ───────────────── */}
        <div className="group relative flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-[#111113] border border-white/10 hover:border-[#ccff00]/40 hover:-translate-y-2 transition-all duration-300 shadow-xl">
          <div>
            {/* Top Row: Icon & Capability Badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/20 flex items-center justify-center text-[#ccff00]">
                <Code2 className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-[#ccff00]/10 border border-[#ccff00]/25 text-[#ccff00] font-semibold">
                FEED &amp; SOS
              </span>
            </div>

            {/* Title & Description */}
            <h3 className="text-xl sm:text-2xl font-bold text-[#f0f0f0] mb-2 group-hover:text-white transition-colors">
              Interactive Feed &amp; Debug SOS
            </h3>
            <p className="text-sm text-[#a0a0a0] leading-relaxed mb-6">
              Social stream of runnable code snippets, project announcements, and high-priority Debug SOS alerts answered in real time.
            </p>

            {/* Interactive Preview: Sandboxed Runtime */}
            <div className="bg-[#09090b]/80 rounded-xl border border-white/10 p-4 mb-6 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-[#ccff00]/10 text-[#ccff00] font-bold text-[10px]">
                    SYS_DEBUG_SOS
                  </span>
                  <span className="text-[#71717a]">quick_lru.js</span>
                </div>
                <span className="text-[10px] text-[#27c93f] flex items-center gap-1">
                  <Check className="w-3 h-3" /> Sandboxed Runtime
                </span>
              </div>
              <div className="space-y-1 text-[11px] text-[#a0a0a0]">
                <div>
                  <span className="text-[#71717a]">&#47;&#47; LRU Cache O(1) eviction test</span>
                </div>
                <div>
                  <span className="text-[#f0f0f0]">cache</span>.
                  <span className="text-[#ccff00]">put</span>(
                  <span className="text-[#b266ff]">&quot;ast&quot;</span>, astTree);{" "}
                  <span className="text-[#27c93f]">&#47;&#47; Executed in 1.4ms</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Link Button */}
          <Link
            to="/features/feed"
            className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#ccff00] hover:text-[#d9ff33] transition-colors pt-2 group-hover:translate-x-1 duration-200"
          >
            <span>Explore Feed →</span>
          </Link>
        </div>

        {/* ── Card 4: Open Projects (/features/projects) ─────────────── */}
        <div className="group relative flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-[#111113] border border-white/10 hover:border-[#b266ff]/40 hover:-translate-y-2 transition-all duration-300 shadow-xl">
          <div>
            {/* Top Row: Icon & Capability Badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#b266ff]/10 border border-[#b266ff]/20 flex items-center justify-center text-[#b266ff]">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-[#b266ff]/10 border border-[#b266ff]/25 text-[#b266ff] font-semibold">
                OPEN PROJECTS
              </span>
            </div>

            {/* Title & Description */}
            <h3 className="text-xl sm:text-2xl font-bold text-[#f0f0f0] mb-2 group-hover:text-white transition-colors">
              Open Projects &amp; Sprints
            </h3>
            <p className="text-sm text-[#a0a0a0] leading-relaxed mb-6">
              Curated open-source repositories and hackathon builds actively recruiting collaborators to ship code together.
            </p>

            {/* Interactive Preview: Repository Showcase */}
            <div className="bg-[#09090b]/80 rounded-xl border border-white/10 p-4 mb-6 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5 text-[11px]">
                <div className="flex items-center gap-2 text-[#f0f0f0] font-semibold">
                  <FolderGit2 className="w-3.5 h-3.5 text-[#b266ff]" />
                  <span>octopair/p2p-mesh</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-[#a0a0a0]">
                  main
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] pt-1">
                <div className="flex gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-[#b266ff]/10 text-[#b266ff] text-[10px]">
                    Rust
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-white/5 text-[#a0a0a0] text-[10px]">
                    Wasm
                  </span>
                </div>
                <span className="text-[10px] text-[#ccff00] font-semibold">
                  2 Open Sprints
                </span>
              </div>
            </div>
          </div>

          {/* Action Link Button */}
          <Link
            to="/features/projects"
            className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#b266ff] hover:text-[#d980fa] transition-colors pt-2 group-hover:translate-x-1 duration-200"
          >
            <span>Explore Projects →</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeatureTeasersSection;
