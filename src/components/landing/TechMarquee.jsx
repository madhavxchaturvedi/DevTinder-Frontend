import React from "react";

/**
 * Tech Stack Infinite Marquee & Transition Divider
 * 
 * Bridges Hero Section into Section 2 with smooth infinite scrolling tech stack pills.
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

export const TechMarquee = () => {
  const marqueeItems = [...TECH_STACK, ...TECH_STACK];

  return (
    <div className="relative w-full py-10 overflow-hidden bg-[#09090b] border-y border-white/[0.08]">
      {/* Subtle Top & Bottom Glowing Divider Lines */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#ccff00]/25 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Eyebrow Label */}
      <div className="text-center mb-5">
        <p className="text-[11px] font-sans uppercase tracking-widest text-neutral-400 font-medium">
          Supported Stacks &amp; Real-Time Environments
        </p>
      </div>

      {/* Infinite Scrolling Track with Edge Gradient Fade */}
      <div 
        className="relative w-full overflow-hidden"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
        }}
      >
        <div className="flex w-max items-center gap-3.5 py-1.5 animate-marquee hover:[animation-play-state:paused]">
          {marqueeItems.map((tech, idx) => (
            <div
              key={`${tech.name}-${idx}`}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111113] border border-white/10 hover:border-white/25 transition-colors select-none group shadow-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00]/80 group-hover:bg-[#ccff00] transition-colors" />
              <span className="font-sans text-xs font-medium text-neutral-300 group-hover:text-white transition-colors">
                {tech.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TechMarquee;
