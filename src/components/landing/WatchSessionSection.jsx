import React, { useRef } from "react";
import { MultiplayerCursor, useMultiplayerCursor } from "./MultiplayerCursor";
import { Play, Terminal, Users, CheckCircle2, Flame, Sparkles } from "lucide-react";

/**
 * Feature F21: Watch A Session Section
 * 
 * - id="sessions"
 * - Looping interactive mockups:
 *   - "Debug Together" (id="session-tile-debug")
 *   - "Hackathon Sprint" (id="session-tile-sprint")
 * - Embeds MultiplayerCursor when hovering either session tile
 */
const WatchSessionSection = () => {
  const debugTileRef = useRef(null);
  const sprintTileRef = useRef(null);

  const debugCursor = useMultiplayerCursor(debugTileRef, {
    label: "You (Guest)",
    color: "#ccff00",
  });

  const sprintCursor = useMultiplayerCursor(sprintTileRef, {
    label: "You (Guest)",
    color: "#b266ff",
  });

  return (
    <section id="sessions" className="relative w-full py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-[#09090b]">
      {/* ── Section Header ─────────────────────────────────────────── */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/25 text-xs font-mono text-[#ccff00] uppercase tracking-wider mb-4">
          <Play className="w-3.5 h-3.5 fill-[#ccff00]" />
          <span>Interactive Demonstrations</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#f0f0f0] mb-4">
          Watch a live <span className="text-[#ccff00]">pair session</span>
        </h2>
        <p className="text-sm sm:text-base text-[#a0a0a0]">
          Hover over either interactive room below to test live multiplayer cursor tracking and review real collaboration sessions.
        </p>
      </div>

      {/* ── Session Tiles Grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── Session Tile 1: Debug Together ──────────────────────── */}
        <div
          id="session-tile-debug"
          ref={debugTileRef}
          {...debugCursor.containerProps}
          className={`relative p-6 sm:p-8 rounded-2xl bg-[#111113] border border-white/10 hover:border-[#ccff00]/40 transition-all duration-300 shadow-xl overflow-hidden ${debugCursor.containerProps.className}`}
        >
          <MultiplayerCursor {...debugCursor.cursorProps} />

          {/* Header row */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/20">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#ccff00]">
                  Live Debug SOS
                </span>
                <h3 className="text-xl font-bold text-[#f0f0f0]">
                  Debug Together
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-white/10 text-xs font-mono text-[#a0a0a0]">
              <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
              <span>2 Peers Active</span>
            </div>
          </div>

          <p className="text-xs text-[#a0a0a0] mb-5 leading-relaxed">
            Maya and Alex tracking down a circular reference memory leak in a high-throughput WebSocket listener.
          </p>

          {/* Simulated Code Panel */}
          <div className="rounded-xl bg-black/70 border border-white/10 p-4 font-mono text-xs mb-4">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/[0.06] text-[11px] text-[#52525b]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500/80" />
                <span className="w-2 h-2 rounded-full bg-yellow-500/80" />
                <span className="w-2 h-2 rounded-full bg-green-500/80" />
                <span className="ml-2 text-[#f0f0f0]">connection_pool.ts</span>
              </div>
              <span className="text-[#ccff00]">diff applied</span>
            </div>
            <pre className="text-[11px] leading-relaxed text-[#a0a0a0]">
              <div><span className="text-[#52525b]">38</span> <span className="text-purple-400">useEffect</span>(() =&gt; &#123;</div>
              <div><span className="text-[#52525b]">39</span>   <span className="text-[#ccff00] font-bold">+</span> socket.on(&quot;drain&quot;, handleDrain);</div>
              <div><span className="text-[#52525b]">40</span>   <span className="text-[#ccff00] font-bold">+</span> <span className="text-yellow-400">return</span> () =&gt; socket.off(&quot;drain&quot;, handleDrain);</div>
              <div><span className="text-[#52525b]">41</span> &#125;, [socket]);</div>
            </pre>
          </div>

          {/* Simulated Terminal Status */}
          <div className="rounded-xl bg-black/50 border border-white/[0.07] p-3 font-mono text-[11px] flex items-center justify-between text-[#a0a0a0]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#ccff00]" />
              <span className="text-[#f0f0f0]">PASS test/memory_leak.test.ts</span>
            </div>
            <span className="text-[#52525b]">0.18s</span>
          </div>
        </div>

        {/* ── Session Tile 2: Hackathon Sprint ─────────────────────── */}
        <div
          id="session-tile-sprint"
          ref={sprintTileRef}
          {...sprintCursor.containerProps}
          className={`relative p-6 sm:p-8 rounded-2xl bg-[#111113] border border-white/10 hover:border-[#b266ff]/40 transition-all duration-300 shadow-xl overflow-hidden ${sprintCursor.containerProps.className}`}
        >
          <MultiplayerCursor {...sprintCursor.cursorProps} />

          {/* Header row */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#b266ff]/10 text-[#b266ff] border border-[#b266ff]/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#b266ff]">
                  Sprint Room
                </span>
                <h3 className="text-xl font-bold text-[#f0f0f0]">
                  Hackathon Sprint
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-white/10 text-xs font-mono text-[#a0a0a0]">
              <span className="w-2 h-2 rounded-full bg-[#b266ff] animate-pulse" />
              <span>3 Peers Active</span>
            </div>
          </div>

          <p className="text-xs text-[#a0a0a0] mb-5 leading-relaxed">
            Team building an offline-first CRDT markdown document editor in 48 hours for the Global Open-Source Hackathon.
          </p>

          {/* Simulated Code Panel */}
          <div className="rounded-xl bg-black/70 border border-white/10 p-4 font-mono text-xs mb-4">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/[0.06] text-[11px] text-[#52525b]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500/80" />
                <span className="w-2 h-2 rounded-full bg-yellow-500/80" />
                <span className="w-2 h-2 rounded-full bg-green-500/80" />
                <span className="ml-2 text-[#f0f0f0]">crdt_sync.rs</span>
              </div>
              <span className="text-[#b266ff]">sync 100%</span>
            </div>
            <pre className="text-[11px] leading-relaxed text-[#a0a0a0]">
              <div><span className="text-[#52525b]">12</span> <span className="text-purple-400">pub fn</span> apply_update(&amp;<span className="text-purple-400">mut self</span>, bin: &amp;[u8]) &#123;</div>
              <div><span className="text-[#52525b]">13</span>   <span className="text-yellow-400">let</span> update = Update::decode(bin).unwrap();</div>
              <div><span className="text-[#52525b]">14</span>   <span className="text-purple-400">self</span>.doc.apply(&amp;update);</div>
              <div><span className="text-[#52525b]">15</span> &#125;</div>
            </pre>
          </div>

          {/* Simulated Terminal Status */}
          <div className="rounded-xl bg-black/50 border border-white/[0.07] p-3 font-mono text-[11px] flex items-center justify-between text-[#a0a0a0]">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#b266ff]" />
              <span className="text-[#f0f0f0]">git commit -m &quot;feat: p2p sync&quot;</span>
            </div>
            <span className="text-[#52525b]">4 co-authors</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WatchSessionSection;
