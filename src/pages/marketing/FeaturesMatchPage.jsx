import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, ArrowLeft, Check, Zap } from "lucide-react";

import HowItWorksSection from "../../components/landing/HowItWorksSection";
import DeveloperMatchingSection from "../../components/landing/DeveloperMatchingSection";
import ProfileShowcaseBand from "../../components/landing/ProfileShowcaseBand";
import FinalCtaSection from "../../components/landing/FinalCtaSection";

/**
 * Skiper UI Interactive Match Deck
 * Embedded directly in the hero viewport of /features/match.
 * Features:
 * - 98% circular compatibility gauge with pulsing glow halo
 * - Shared skills chips (Rust, WebRTC, Tokio)
 * - Animated "Ready to pair right now" live beacon
 * - Interactive card token swap toggle (Compatibility vs Proof of Work)
 */
const HeroMatchDeck = () => {
  const [activeTab, setActiveTab] = useState("compatibility");
  const [connected, setConnected] = useState(false);

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl bg-[#111113] border border-white/10 p-6 relative overflow-hidden shadow-2xl transition-all duration-300 hover:border-white/20">
      {/* Ambient Decorative Glow */}
      <div
        aria-hidden="true"
        className="absolute -top-16 -right-16 w-44 h-44 bg-[#ccff00]/15 blur-3xl pointer-events-none rounded-full"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-16 -left-16 w-44 h-44 bg-[#b266ff]/15 blur-3xl pointer-events-none rounded-full"
      />

      {/* Top Bar: Ready to pair beacon */}
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] text-xs font-mono">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ccff00] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ccff00]" />
          </span>
          <span className="font-bold">Ready to pair right now</span>
        </div>

        {/* View Toggle Pill */}
        <div className="inline-flex items-center p-0.5 rounded-lg bg-black/40 border border-white/10 text-[10px] font-mono">
          <button
            type="button"
            onClick={() => setActiveTab("compatibility")}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              activeTab === "compatibility"
                ? "bg-[#ccff00] text-black font-bold shadow-sm"
                : "text-[#a0a0a0] hover:text-[#f0f0f0]"
            }`}
          >
            Chemistry
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("proof")}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              activeTab === "proof"
                ? "bg-[#ccff00] text-black font-bold shadow-sm"
                : "text-[#a0a0a0] hover:text-[#f0f0f0]"
            }`}
          >
            Proof
          </button>
        </div>
      </div>

      {/* Candidate Profile Header */}
      <div className="flex items-center gap-4 mb-6 relative z-10">
        <div className="relative shrink-0">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-[#b266ff] to-[#ccff00] p-[2px]">
            <div className="w-full h-full rounded-[10px] bg-[#111113] flex items-center justify-center font-mono font-bold text-lg text-[#f0f0f0]">
              ER
            </div>
          </div>
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#ccff00] border-2 border-[#111113] flex items-center justify-center">
            <Check className="w-2.5 h-2.5 text-black stroke-[3]" />
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-bold text-[#f0f0f0] truncate font-sans">
              Elena Rostova
            </h4>
            <span className="text-[10px] font-mono text-zinc-400">@erostova</span>
          </div>
          <p className="text-xs text-[#a0a0a0] truncate mt-0.5">
            Systems &amp; Distributed Architect
          </p>
          <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-zinc-500">
            <span>Berlin (UTC+1)</span>
            <span>•</span>
            <span className="text-emerald-400">Online now</span>
          </div>
        </div>
      </div>

      {activeTab === "compatibility" ? (
        /* ── Chemistry & Compatibility View ── */
        <div className="space-y-5 relative z-10">
          {/* Circular 98% Gauge + Metric summary */}
          <div className="flex items-center gap-6 p-4 rounded-xl bg-black/40 border border-white/5">
            {/* SVG Circular Compatibility Ring */}
            <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#ccff00"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset="5.02" /* 98% complete */
                  strokeLinecap="round"
                  fill="transparent"
                  className="drop-shadow-[0_0_8px_rgba(204,255,0,0.6)]"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-lg font-bold font-mono text-[#f0f0f0] tracking-tight">
                  98%
                </span>
                <span className="text-[8px] font-mono text-[#ccff00] font-bold uppercase tracking-wider">
                  MATCH
                </span>
              </div>
            </div>

            <div className="flex-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                Chemistry Rating
              </span>
              <p className="text-xs text-[#f0f0f0] font-medium leading-snug">
                Ideal collaborator for your <span className="text-[#ccff00] font-mono font-bold">WebRTC P2P Data Mesh</span> sprint.
              </p>
            </div>
          </div>

          {/* Shared Skills Pills */}
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-2">
              Shared Core Stack (3/3 Matches)
            </span>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] text-xs font-mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00]" />
                Rust
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#b266ff]/10 border border-[#b266ff]/30 text-[#b266ff] text-xs font-mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#b266ff]" />
                WebRTC
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-zinc-300 text-xs font-mono">
                Tokio
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-zinc-300 text-xs font-mono">
                P2P Mesh
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* ── Proof of Work View ── */
        <div className="space-y-3 relative z-10">
          <div className="p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-xs">
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <span className="text-[#ccff00] font-bold">octopair/sync-engine</span>
              <span className="text-[10px] text-zinc-500">Merged 2d ago</span>
            </div>
            <p className="text-zinc-300 text-[11px]">
              feat(transport): implement instant, real-time code synchronization pipeline
            </p>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-xs">
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <span className="text-[#b266ff] font-bold">libp2p/rust-mesh</span>
              <span className="text-[10px] text-zinc-500">Co-authored PR</span>
            </div>
            <p className="text-zinc-300 text-[11px]">
              fix(ice): optimize NAT traversal candidate negotiation latency
            </p>
          </div>
        </div>
      )}

      {/* Interactive Deck CTA Button */}
      <div className="mt-6 pt-4 border-t border-white/[0.08] relative z-10">
        <button
          type="button"
          onClick={() => setConnected(!connected)}
          className={`w-full py-2.5 px-4 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            connected
              ? "bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/40"
              : "bg-[#ccff00] hover:bg-[#d9ff33] text-black shadow-[0_0_15px_rgba(204,255,0,0.25)]"
          }`}
        >
          {connected ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Pairing Request Dispatched</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 fill-black" />
              <span>Instant Pair With Elena</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

/**
 * FeaturesMatchPage (/features/match)
 *
 * Dedicated marketing sub-page for Developer Discovery & Skill-Based Matchmaking.
 * Senior UI/UX Overhaul:
 * - 2-Column Split Hero with Skiper UI Interactive Match Deck
 * - Primary semantic h1 title
 * - Redundant platform pillars band removed
 * - HowItWorksSection: 4-step interactive story navigator
 * - DeveloperMatchingSection: Interactive swipeable deck + match modal
 * - ProfileShowcaseBand: Authentic developer capability cards
 * - Inter-feature CTA link to /features/collab
 * - Closing signup CTA banner routing to /login?mode=signup
 */
const FeaturesMatchPage = () => {
  return (
    <div className="w-full bg-[#09090b] text-[#f0f0f0] overflow-x-clip">
      {/* ── Split Visual Hero ───────────────────────────────────────── */}
      <section className="relative w-full pt-16 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Ambient Top Glow */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] max-w-full h-[320px] bg-[#b266ff]/[0.08] blur-[140px] pointer-events-none rounded-full"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Column: Headlines & CTAs */}
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
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#b266ff]/10 border border-[#b266ff]/25 text-xs font-mono text-[#b266ff] uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SKILL-BASED MATCHMAKING</span>
            </div>

            {/* Semantic Title: Exactly one h1 */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#f0f0f0] mb-6 leading-[1.1]">
              Developer Discovery &amp; Matchmaking
            </h1>

            {/* Descriptive Subtitle */}
            <p className="text-base sm:text-lg text-[#a0a0a0] max-w-xl leading-relaxed mb-8 font-normal">
              Find high-signal collaborators filtered by verified tech stacks, proof of work, and real-time compatibility scoring.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-8">
              <Link
                to="/login?mode=signup"
                className="w-full sm:w-auto bg-[#ccff00] hover:bg-[#d9ff33] text-black font-bold font-mono text-sm px-6 py-3.5 rounded-xl transition-all duration-200 inline-flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(204,255,0,0.25)]"
              >
                <span>Start Pairing Free</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/features/collab"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-[#f0f0f0] transition-colors inline-flex items-center justify-center gap-2"
              >
                <span>Explore Live Collaboration</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Technical Proof Points */}
            <div className="flex items-center gap-6 text-xs font-mono text-[#52525b]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00]" />
                <span>98% Chemistry Accuracy</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#b266ff]" />
                <span>Verified Proof of Work</span>
              </div>
            </div>
          </div>

          {/* Right Column: Skiper UI Interactive Match Deck */}
          <div className="lg:col-span-6 w-full flex justify-center">
            <HeroMatchDeck />
          </div>
        </div>
      </section>

      {/* ── Assembled Landing Sections ─────────────────────────────── */}
      <HowItWorksSection />
      <DeveloperMatchingSection />
      <ProfileShowcaseBand />

      {/* ── Inter-Feature Navigation CTA ───────────────────────────── */}
      <section className="relative w-full py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="p-6 sm:p-8 rounded-2xl bg-[#111113] border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <span className="text-[11px] font-mono text-[#a0a0a0] uppercase tracking-wider block mb-1">
              Next Capability
            </span>
            <h3 className="text-xl font-bold text-[#f0f0f0]">
              Sub-50ms Live Collaboration
            </h3>
            <p className="text-xs text-[#a0a0a0] mt-1">
              Multiplayer IDE with instant real-time code synchronization, shared cloud terminals, and synced previews.
            </p>
          </div>
          <Link
            to="/features/collab"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-mono font-semibold text-[#f0f0f0] border border-white/15 transition-all group shrink-0"
          >
            <span>Explore Live Collaboration</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* ── Closing Banner CTA ─────────────────────────────────────── */}
      <FinalCtaSection />
    </div>
  );
};

export default FeaturesMatchPage;
