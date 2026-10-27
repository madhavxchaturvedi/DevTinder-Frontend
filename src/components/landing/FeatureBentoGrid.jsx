import React from "react";
import { Zap, Terminal, Layout, ShieldCheck, Radio } from "lucide-react";

/**
 * Feature F20: Feature Bento Grid
 * 
 * - id="features"
 * - 5 cards with white/10 hairline borders (border-white/10)
 * - Hover rise: hover:-translate-y-2 transition-transform duration-300
 * - Invariant: Strictly zero font-weight transitions on hover (CLS prevention)
 */
const FeatureBentoGrid = () => {
  return (
    <section id="features" className="relative w-full py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-[#09090b]">
      {/* ── Section Header ─────────────────────────────────────────── */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#b266ff]/10 border border-[#b266ff]/25 text-xs font-mono text-[#b266ff] uppercase tracking-wider mb-4">
          <span>Engineered Capabilities</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#f0f0f0] mb-4">
          Built for <span className="text-[#ccff00]">real-time velocity</span>
        </h2>
        <p className="text-sm sm:text-base text-[#a0a0a0]">
          Every feature is optimized for zero context switching and frictionless collaboration.
        </p>
      </div>

      {/* ── 5 Bento Cards Grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 (Span 2): WebRTC Peer Engine */}
        <div className="md:col-span-2 p-8 rounded-2xl bg-[#111113] border border-white/10 hover:border-[#ccff00]/40 hover:-translate-y-2 transition-transform duration-300 flex flex-col justify-between group shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/25 text-[#ccff00]">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono text-[#52525b] uppercase tracking-wider">
                FEATURE // 01
              </span>
            </div>
            <h3 className="text-2xl font-bold text-[#f0f0f0] mb-3 group-hover:text-white transition-colors">
              Sub-50ms WebRTC Peer Engine
            </h3>
            <p className="text-sm text-[#a0a0a0] leading-relaxed max-w-xl mb-6">
              Conflict-free operational transformation runs directly over WebRTC data channels. Typing, selection bounds, and file switching occur in real time without waiting for centralized server round-trips.
            </p>
          </div>

          <div className="rounded-xl bg-black/60 border border-white/10 p-4 font-mono text-xs">
            <div className="flex items-center justify-between text-[#a0a0a0] mb-2 pb-2 border-b border-white/[0.06]">
              <span className="text-[#ccff00]">● WebRTC P2P DataChannel Active</span>
              <span className="text-[#52525b]">RTT: 28ms</span>
            </div>
            <div className="text-[11px] text-[#f0f0f0]">
              <code>syncOp(&#123; type: "insert", path: "src/engine.ts", pos: 104, char: "const" &#125;)</code>
            </div>
          </div>
        </div>

        {/* Card 2 (Span 1): In-Browser Cloud Container Terminal */}
        <div className="md:col-span-1 p-8 rounded-2xl bg-[#111113] border border-white/10 hover:border-[#b266ff]/40 hover:-translate-y-2 transition-transform duration-300 flex flex-col justify-between group shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 rounded-xl bg-[#b266ff]/10 border border-[#b266ff]/25 text-[#b266ff]">
                <Terminal className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono text-[#52525b] uppercase tracking-wider">
                FEATURE // 02
              </span>
            </div>
            <h3 className="text-xl font-bold text-[#f0f0f0] mb-3 group-hover:text-white transition-colors">
              Ephemeral Cloud Terminal
            </h3>
            <p className="text-sm text-[#a0a0a0] leading-relaxed mb-6">
              Full interactive bash terminal with root privileges, npm/cargo/pip toolchains, and automatic port forwarding for instant preview testing.
            </p>
          </div>

          <div className="rounded-xl bg-black/60 border border-white/10 p-3 font-mono text-[11px] text-[#ccff00]">
            <div>$ cargo test --quiet</div>
            <div className="text-[#a0a0a0] mt-1">test engine::test_p2p_sync ... ok</div>
            <div className="text-[#f0f0f0] mt-1">test result: ok. 14 passed; 0 failed</div>
          </div>
        </div>

        {/* Card 3 (Span 1): Live Architecture Canvas */}
        <div className="md:col-span-1 p-8 rounded-2xl bg-[#111113] border border-white/10 hover:border-[#b266ff]/40 hover:-translate-y-2 transition-transform duration-300 flex flex-col justify-between group shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 rounded-xl bg-[#b266ff]/10 border border-[#b266ff]/25 text-[#b266ff]">
                <Layout className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono text-[#52525b] uppercase tracking-wider">
                FEATURE // 03
              </span>
            </div>
            <h3 className="text-xl font-bold text-[#f0f0f0] mb-3 group-hover:text-white transition-colors">
              Live Architecture Canvas
            </h3>
            <p className="text-sm text-[#a0a0a0] leading-relaxed mb-6">
              Diagram database relationships, sketch API contracts, and coordinate system boundaries on an infinite multiplayer vector canvas alongside your code.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between text-xs font-mono text-[#a0a0a0]">
            <span>Schema & Flow Graph</span>
            <span className="text-[#b266ff]">60 FPS Canvas</span>
          </div>
        </div>

        {/* Card 4 (Span 1): Verified Proof of Work */}
        <div className="md:col-span-1 p-8 rounded-2xl bg-[#111113] border border-white/10 hover:border-[#ccff00]/40 hover:-translate-y-2 transition-transform duration-300 flex flex-col justify-between group shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/25 text-[#ccff00]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono text-[#52525b] uppercase tracking-wider">
                FEATURE // 04
              </span>
            </div>
            <h3 className="text-xl font-bold text-[#f0f0f0] mb-3 group-hover:text-white transition-colors">
              Verified Proof of Work
            </h3>
            <p className="text-sm text-[#a0a0a0] leading-relaxed mb-6">
              Cryptographically signed commit co-authorship. Showcase real collaboration track records with zero resume fluff or unverified claims.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-[#a0a0a0]">
            <span className="text-[#ccff00]">Verified Co-authored-by</span>
          </div>
        </div>

        {/* Card 5 (Span 1): Live Debug SOS Radar */}
        <div className="md:col-span-1 p-8 rounded-2xl bg-[#111113] border border-white/10 hover:border-[#ccff00]/40 hover:-translate-y-2 transition-transform duration-300 flex flex-col justify-between group shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/25 text-[#ccff00]">
                <Radio className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono text-[#52525b] uppercase tracking-wider">
                FEATURE // 05
              </span>
            </div>
            <h3 className="text-xl font-bold text-[#f0f0f0] mb-3 group-hover:text-white transition-colors">
              Debug SOS Radar
            </h3>
            <p className="text-sm text-[#a0a0a0] leading-relaxed mb-6">
              Hit a blocking memory leak or concurrency deadlock? Broadcast an urgent SOS signal to senior engineers active in your tech stack.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between text-xs font-mono text-[#a0a0a0]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
              <span>SOS Active</span>
            </span>
            <span className="text-[#b266ff]">Avg Solve: 8m</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureBentoGrid;
