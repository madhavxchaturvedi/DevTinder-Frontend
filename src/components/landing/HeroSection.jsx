import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
import HeroMockEditor from "./HeroMockEditor";
import SendToLaptopButton from "./SendToLaptopButton";

/**
 * Feature F13: Hero Section & Headline
 * 
 * - Single headline element: "Pick a project. Pair up. Build it live."
 * - Eyebrow badge: "THE MULTIPLAYER IDE FOR BUILDERS" with #ccff00 dot
 * - Primary CTA: Routes to /login?mode=signup ("Start Pairing Now")
 * - Secondary CTA: Anchors to #sessions ("Watch a session")
 * - Mobile 375px: "Send this link to my laptop" button with Web Share API
 * - Interactive Mock Editor Host: embeds HeroMockEditor with multiplayer cursor
 */
const HeroSection = () => {
  return (
    <section className="relative w-full pt-28 pb-16 sm:pt-36 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center overflow-visible">
      {/* ── Pitch-Black Ambient Glows ──────────────────────────────────── */}
      <div 
        aria-hidden="true"
        className="absolute -top-12 left-1/2 -translate-x-1/2 w-[700px] max-w-full h-[400px] bg-[#ccff00]/[0.06] blur-[150px] pointer-events-none rounded-full" 
      />
      <div 
        aria-hidden="true"
        className="absolute top-48 right-[10%] w-[450px] h-[350px] bg-[#b266ff]/[0.05] blur-[140px] pointer-events-none rounded-full" 
      />

      {/* ── Eyebrow Badge ──────────────────────────────────────────────── */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/25 text-[#ccff00] text-[11px] sm:text-xs font-mono font-semibold uppercase tracking-widest mb-6 shadow-[0_0_15px_rgba(204,255,0,0.12)]">
        <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
        <span>THE MULTIPLAYER IDE FOR BUILDERS</span>
      </div>

      {/* ── Headline ───────────────────────────────────────────────────── */}
      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#f0f0f0] leading-[1.08] max-w-4xl mx-auto mb-6">
        Pick a project. Pair up.{" "}
        <span className="bg-gradient-to-r from-[#ccff00] via-[#d4ff33] to-[#b266ff] bg-clip-text text-transparent">
          Build it live.
        </span>
      </h1>

      {/* ── Subhead Supporting Copy ─────────────────────────────────────── */}
      <p className="text-base sm:text-lg md:text-xl text-[#a0a0a0] max-w-2xl mx-auto leading-relaxed font-normal mb-8">
        The real-time collaborative workspace for engineers. Instant matching, sub-50ms peer sync, and in-browser pair programming for ambitious developers.
      </p>

      {/* ── Call To Action Cluster ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-6">
        {/* Primary CTA */}
        <Link
          to="/login?mode=signup"
          className="w-full sm:w-auto bg-[#ccff00] hover:bg-[#d9ff33] text-black font-bold text-sm sm:text-base px-7 py-3.5 rounded-lg shadow-[0_0_20px_rgba(204,255,0,0.25)] hover:shadow-[0_0_30px_rgba(204,255,0,0.4)] transition-all duration-200 inline-flex items-center justify-center gap-2 group active:scale-[0.98]"
        >
          <span>Start Pairing Now</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>

        {/* Secondary CTA */}
        <Link
          to="/features/collab#sessions"
          className="w-full sm:w-auto bg-transparent border border-white/10 hover:border-white/20 text-[#a0a0a0] hover:text-[#f0f0f0] font-medium text-sm sm:text-base px-7 py-3.5 rounded-lg hover:bg-white/5 transition-all duration-200 inline-flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <Play className="w-4 h-4 text-[#b266ff] fill-[#b266ff]/20" />
          <span>Watch a session</span>
        </Link>
      </div>

      {/* ── Mobile 375px 'Send to laptop' Action Button ───────────────── */}
      <div className="sm:hidden w-full max-w-xs mb-8">
        <SendToLaptopButton />
      </div>

      {/* ── Key Technical Proof Points ─────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-mono text-[#52525b] mb-12 sm:mb-16">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00]" />
          <span>Sub-50ms Peer Sync</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#b266ff]" />
          <span>Live WebRTC Terminals</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
          <span>Zero Local Setup</span>
        </div>
      </div>

      {/* ── Interactive Mock Editor Container ──────────────────────────── */}
      <div className="w-full max-w-5xl mx-auto relative px-2 sm:px-0">
        <div 
          aria-hidden="true"
          className="absolute -inset-1 rounded-2xl bg-gradient-to-b from-white/10 to-transparent opacity-50 blur-sm pointer-events-none" 
        />
        <HeroMockEditor />
      </div>
    </section>
  );
};

export default HeroSection;
