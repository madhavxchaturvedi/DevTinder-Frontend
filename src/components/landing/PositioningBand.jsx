import React from "react";
import { Zap, GitBranch, ShieldCheck } from "lucide-react";

/**
 * Feature F18: Positioning Band
 * 
 * High-contrast 3-pillar value statement:
 * 1. Instant Sync (WebRTC)
 * 2. Curated Project Graph (Live repositories)
 * 3. Verified Proof of Work (GitHub Co-Author Credit)
 */
const PositioningBand = () => {
  const pillars = [
    {
      icon: Zap,
      accent: "#ccff00",
      accentBg: "bg-[#ccff00]/10 border-[#ccff00]/25 text-[#ccff00]",
      title: "Instant Sync",
      technology: "WebRTC Data Channels",
      description:
        "Direct browser-to-browser code sync eliminates server lag. Type, debug, and execute code simultaneously with instant real-time updates.",
      badge: "Real-Time Engine",
      caption: "Instant Sync",
    },
    {
      icon: GitBranch,
      accent: "#b266ff",
      accentBg: "bg-[#b266ff]/10 border-[#b266ff]/25 text-[#b266ff]",
      title: "Curated Project Graph",
      technology: "Live Repositories",
      description:
        "Explore a curated project graph connected to active open-source and hackathon codebases. Find rooms needing your exact language and framework skills in seconds.",
      badge: "Discovery Network",
      caption: "Active Repositories",
    },
    {
      icon: ShieldCheck,
      accent: "#f0f0f0",
      accentBg: "bg-white/10 border-white/20 text-[#f0f0f0]",
      title: "Verified Proof of Work",
      technology: "GitHub Co-Author Credit",
      description:
        "Every shared session produces verified GitHub co-author credit on every commit. Turn pair programming hours into demonstrable portfolio proof of work.",
      badge: "Career Signal",
      caption: "Verified Commits",
    },
  ];

  return (
    <section className="relative w-full py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-[#09090b]">
      {/* ── Section Header ─────────────────────────────────────────── */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#a0a0a0] uppercase tracking-wider mb-4">
          <span>Engineered for Reliability</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#f0f0f0] mb-4">
          Why top engineers pair on{" "}
          <span className="text-[#ccff00]">OctoPair</span>
        </h2>
        <p className="text-sm sm:text-base text-[#a0a0a0] leading-relaxed">
          Traditional code sharing uses screen shares with input lag and disconnects. OctoPair replaces video streams with native peer synchronization.
        </p>
      </div>

      {/* ── 3 Pillar Cards Grid ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {pillars.map((pillar, idx) => {
          const Icon = pillar.icon;
          return (
            <div
              key={pillar.title}
              className="relative p-7 rounded-2xl bg-[#111113] border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col justify-between group shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className={`p-3 rounded-xl border ${pillar.accentBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#52525b]">
                    0{idx + 1} // {pillar.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#f0f0f0] mb-2 group-hover:text-white transition-colors">
                  {pillar.title}
                </h3>

                <p className="text-xs font-mono text-[#ccff00] mb-4">
                  {pillar.technology}
                </p>

                <p className="text-sm text-[#a0a0a0] leading-relaxed">
                  {pillar.description}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-white/[0.07] flex items-center justify-between text-xs font-mono text-[#52525b]">
                <span>{pillar.caption}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00]" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PositioningBand;
