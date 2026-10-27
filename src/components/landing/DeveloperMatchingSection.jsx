import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { UserPlus, X, Sparkles, Zap, ArrowRight, RotateCcw, Heart, UserCheck } from "lucide-react";
import LandingMatchModal from "./LandingMatchModal";

const DEMO_DEVS = [
  {
    id: 1,
    name: "Elena Rostova",
    role: "Systems Engineer",
    skills: ["Rust", "WebRTC", "Distributed Systems"],
    sharedSkills: ["Rust", "WebRTC"],
    compatibility: 98,
    bio: "Building low-latency mesh networking libs. Looking for a frontend partner.",
    initials: "ER",
  },
  {
    id: 2,
    name: "Alex Rivera",
    role: "Full-Stack Developer",
    skills: ["React", "Node.js", "PostgreSQL"],
    sharedSkills: ["React"],
    compatibility: 91,
    bio: "Shipping SaaS products for 4 years. Wants a systems co-builder.",
    initials: "AR",
  },
  {
    id: 3,
    name: "Maya Patel",
    role: "ML Engineer",
    skills: ["Python", "PyTorch", "FastAPI"],
    sharedSkills: ["Python", "FastAPI"],
    compatibility: 85,
    bio: "Building open-source inference engines. Needs a backend architect.",
    initials: "MP",
  },
];

const DeveloperMatchingSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchedDev, setMatchedDev] = useState(null);
  const [direction, setDirection] = useState(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      setIsReducedMotion(mq.matches);
      const listener = (e) => setIsReducedMotion(e.matches);
      mq.addEventListener?.("change", listener);
      return () => mq.removeEventListener?.("change", listener);
    }
  }, []);

  const handleSkip = () => {
    if (currentIndex >= DEMO_DEVS.length) return;
    if (isReducedMotion) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }
    setDirection("left");
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setDirection(null);
    }, 300);
  };

  const handleConnect = () => {
    if (currentIndex >= DEMO_DEVS.length) return;
    const currentDev = DEMO_DEVS[currentIndex];
    setMatchedDev(currentDev);
    if (isReducedMotion) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }
    setDirection("right");
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setDirection(null);
    }, 300);
  };

  const isExhausted = currentIndex >= DEMO_DEVS.length;
  const visibleDevs = DEMO_DEVS.slice(currentIndex, currentIndex + 3);

  return (
    <section id="matching" className="relative w-full py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-[#09090b]">
      {/* ── Section Header ─────────────────────────────────────────── */}
      <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#b266ff]/10 border border-[#b266ff]/25 text-xs font-mono text-[#b266ff] uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>SKILL-BASED MATCHING</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#f0f0f0] mb-4">
          Find your <span className="text-[#ccff00]">ideal coding partner</span>
        </h2>
        <p className="text-sm sm:text-base text-[#a0a0a0]">
          Mutual discovery scored by tech stack overlap, past verified builds, and project goals.
        </p>

        {/* Follow vs Connect Explainer */}
        <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs font-mono text-[#a0a0a0] bg-white/[0.03] border border-white/10 rounded-full px-5 py-2.5 max-w-fit mx-auto">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#b266ff]" />
            <span className="text-[#f0f0f0] font-bold">Follow:</span>
            <span>see their posts</span>
          </div>
          <span className="hidden sm:inline text-white/20">|</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ccff00]" />
            <span className="text-[#f0f0f0] font-bold">Connect:</span>
            <span>chat and build</span>
          </div>
        </div>
      </div>

      {/* ── Interactive Card Deck Frame ────────────────────────────── */}
      <div className="max-w-md mx-auto relative min-h-[500px] flex flex-col items-center">
        {!isExhausted ? (
          <div className="w-full relative h-[420px]">
            {visibleDevs.map((dev, i) => {
              const isTop = i === 0;
              let transformClasses = "translate-y-0 scale-100 z-30 opacity-100";
              if (i === 1) transformClasses = "translate-y-3 scale-[0.96] z-20 opacity-70 pointer-events-none";
              if (i === 2) transformClasses = "translate-y-6 scale-[0.92] z-10 opacity-40 pointer-events-none";

              if (isTop && direction === "left" && !isReducedMotion) {
                transformClasses = "-translate-x-32 -rotate-12 opacity-0 z-30";
              } else if (isTop && direction === "right" && !isReducedMotion) {
                transformClasses = "translate-x-32 rotate-12 opacity-0 z-30";
              }

              const CardElement = isTop ? Motion.div : "div";
              const motionProps = isTop && !isReducedMotion ? {
                drag: "x",
                dragDirectionLock: true,
                dragConstraints: { left: 0, right: 0 },
                onDragEnd: (e, { offset }) => {
                  if (offset.x > 80) handleConnect();
                  else if (offset.x < -80) handleSkip();
                },
              } : {};

              return (
                <CardElement
                  key={dev.id}
                  {...motionProps}
                  className={`absolute inset-0 rounded-2xl bg-[#111113] border border-white/10 p-6 sm:p-8 flex flex-col justify-between shadow-2xl transition-all duration-300 ease-out select-none touch-pan-y ${transformClasses}`}
                >
                  {/* Top Candidate Badge */}
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        {/* 2-Letter Initials Circle */}
                        <div className="w-12 h-12 rounded-full bg-[#b266ff]/20 border border-[#b266ff]/40 flex items-center justify-center font-bold text-sm font-mono text-[#b266ff] shadow-[0_0_15px_rgba(178,102,255,0.15)]">
                          {dev.initials}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-[#f0f0f0] tracking-tight">
                            {dev.name}
                          </h3>
                          <p className="text-xs font-mono text-[#a0a0a0]">
                            {dev.role}
                          </p>
                        </div>
                      </div>

                      {/* Compatibility Badge */}
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] text-xs font-mono font-bold">
                        <Zap className="w-3.5 h-3.5" />
                        <span>{dev.compatibility}%</span>
                      </div>
                    </div>

                    {/* Compatibility Progress Bar */}
                    <div className="w-full bg-white/10 rounded-full h-1.5 mb-5 overflow-hidden">
                      <div
                        className="bg-[#ccff00] h-full rounded-full transition-all duration-500 motion-reduce:transition-none"
                        style={{ width: `${dev.compatibility}%` }}
                      />
                    </div>

                    {/* Bio */}
                    <p className="text-xs sm:text-sm text-[#a0a0a0] leading-relaxed mb-5">
                      {dev.bio}
                    </p>

                    {/* Skill Chips with Shared Skills Highlighted */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {dev.skills.map((skill) => {
                        const isShared = dev.sharedSkills?.includes(skill);
                        return (
                          <span
                            key={skill}
                            className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors ${
                              isShared
                                ? "bg-[#ccff00]/15 border border-[#ccff00]/40 text-[#ccff00] font-semibold"
                                : "bg-white/5 border border-white/10 text-[#f0f0f0]"
                            }`}
                          >
                            {isShared && (
                              <Sparkles className="w-3 h-3 inline mr-1 text-[#ccff00]" />
                            )}
                            {skill}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Card Micro Footer */}
                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-[#52525b]">
                    <span>CANDIDATE // 0{dev.id}</span>
                    <span className="text-[#ccff00]/80">SHARED SKILLS HIGHLIGHTED</span>
                  </div>
                </CardElement>
              );
            })}
          </div>
        ) : (
          /* Deck Exhausted State */
          <div className="w-full h-[420px] rounded-2xl bg-[#111113] border border-white/10 p-8 flex flex-col items-center justify-center text-center shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-[#b266ff]/20 border border-[#b266ff]/30 text-[#b266ff] flex items-center justify-center mb-4">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-[#f0f0f0] mb-2">You've seen everyone</h3>
            <p className="text-xs sm:text-sm text-[#a0a0a0] max-w-xs mb-6">
              Sign up to discover real developers actively matching and pairing right now.
            </p>
            <Link
              to="/login?mode=signup"
              className="w-full bg-[#ccff00] hover:bg-[#d9ff33] text-black font-bold text-sm py-3 px-6 rounded-xl inline-flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.25)] transition-all duration-200"
            >
              <span>Explore Real Developers</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setCurrentIndex(0)}
              className="mt-4 text-xs font-mono text-[#a0a0a0] hover:text-white inline-flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay Demo Deck</span>
            </button>
          </div>
        )}

        {/* ── Action Buttons ─────────────────────────────────────────── */}
        {!isExhausted && (
          <div className="flex items-center justify-center gap-4 mt-6 w-full">
            <button
              onClick={handleSkip}
              disabled={Boolean(direction)}
              aria-label="Skip developer"
              className="flex-1 py-3 px-6 rounded-xl bg-[#111113] border border-white/10 hover:border-white/30 text-[#a0a0a0] hover:text-white font-mono text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <X className="w-4 h-4 text-red-400" />
              <span>Skip</span>
            </button>
            <button
              onClick={handleConnect}
              disabled={Boolean(direction)}
              aria-label="Connect with developer"
              className="flex-1 py-3 px-6 rounded-xl bg-[#ccff00] hover:bg-[#d9ff33] text-black font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(204,255,0,0.2)] transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>Connect</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Match Confirmation Modal Trigger ────────────────────────── */}
      {matchedDev && (
        <LandingMatchModal dev={matchedDev} onClose={() => setMatchedDev(null)} />
      )}
    </section>
  );
};

export default DeveloperMatchingSection;
