import React from "react";

/**
 * Feature F17: Tech Stack Infinite Marquee
 * 
 * - Renders 16+ languages and frameworks:
 *   React, TypeScript, Python, Rust, Go, Node.js, Next.js, Docker,
 *   Tailwind CSS, GraphQL, PostgreSQL, Redis, Kubernetes, WebRTC, Linux, Git
 * - Tailwind v4 infinite marquee animation with pause on hover: hover:[animation-play-state:paused]
 * - Edge mask fades with linear-gradient / mask-image
 */
const TECH_STACK = [
  { name: "React", category: "Frontend" },
  { name: "TypeScript", category: "Language" },
  { name: "Python", category: "Language" },
  { name: "Rust", category: "Systems" },
  { name: "Go", category: "Backend" },
  { name: "Node.js", category: "Runtime" },
  { name: "Next.js", category: "Framework" },
  { name: "Docker", category: "DevOps" },
  { name: "Tailwind CSS", category: "Styling" },
  { name: "GraphQL", category: "API" },
  { name: "PostgreSQL", category: "Database" },
  { name: "Redis", category: "Cache" },
  { name: "Kubernetes", category: "Orchestration" },
  { name: "WebRTC", category: "Real-time" },
  { name: "Linux", category: "OS" },
  { name: "Git", category: "VCS" },
];

const TechMarquee = () => {
  // Duplicate items for continuous seamless loop
  const marqueeItems = [...TECH_STACK, ...TECH_STACK];

  return (
    <section className="relative w-full py-12 overflow-hidden bg-[#09090b] border-y border-white/[0.07]">
      {/* ── Subtitle / Eyebrow ─────────────────────────────────────── */}
      <div className="text-center mb-6">
        <p className="text-[11px] font-mono uppercase tracking-widest text-[#52525b]">
          Supported Stacks & Real-Time Runtimes
        </p>
      </div>

      {/* ── Edge Mask Wrapper ───────────────────────────────────────── */}
      <div 
        className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        }}
      >
        <div className="flex w-max items-center gap-4 py-2 animate-marquee hover:[animation-play-state:paused]">
          {marqueeItems.map((tech, idx) => (
            <div
              key={`${tech.name}-${idx}`}
              className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#111113] border border-white/10 hover:border-[#ccff00]/40 transition-colors duration-200 select-none group shadow-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00]/70 group-hover:bg-[#ccff00] transition-colors" />
              <span className="font-mono text-xs font-medium text-[#f0f0f0] group-hover:text-white transition-colors">
                {tech.name}
              </span>
              <span className="text-[10px] font-mono text-[#52525b] group-hover:text-[#a0a0a0] transition-colors">
                {tech.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechMarquee;
