import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, ArrowLeft } from "lucide-react";

import PositioningBand from "../../components/landing/PositioningBand";
import HowItWorksSection from "../../components/landing/HowItWorksSection";
import DeveloperMatchingSection from "../../components/landing/DeveloperMatchingSection";
import ProfileShowcaseBand from "../../components/landing/ProfileShowcaseBand";
import FinalCtaSection from "../../components/landing/FinalCtaSection";

/**
 * FeaturesMatchPage (/features/match)
 *
 * Dedicated marketing sub-page for Developer Discovery & Skill-Based Matchmaking.
 * Assembles:
 * - Hero header with Sparkles eyebrow badge, back navigation, and action CTAs
 * - PositioningBand: 3 architectural pillars
 * - HowItWorksSection: 4-step interactive story navigator
 * - DeveloperMatchingSection: Interactive swipeable deck + match modal
 * - ProfileShowcaseBand: Authentic developer capability cards
 * - Inter-feature CTA link to /features/collab
 * - Closing signup CTA banner routing to /login?mode=signup
 */
const FeaturesMatchPage = () => {
  return (
    <div className="w-full bg-[#09090b] text-[#f0f0f0] overflow-x-hidden">
      {/* ── Hero Header ────────────────────────────────────────────── */}
      <section className="relative w-full pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Ambient Top Glow */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] max-w-full h-[280px] bg-[#b266ff]/[0.08] blur-[130px] pointer-events-none rounded-full"
        />

        {/* Breadcrumb / Back Link */}
        <div className="flex items-center justify-center mb-6 relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-[#a0a0a0] hover:text-[#f0f0f0] transition-colors px-3 py-1.5 rounded-full bg-white/5 border border-white/10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Overview</span>
          </Link>
        </div>

        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#b266ff]/10 border border-[#b266ff]/25 text-xs font-mono text-[#b266ff] uppercase tracking-wider mb-6 relative z-10">
          <Sparkles className="w-3.5 h-3.5" />
          <span>SKILL-BASED MATCHMAKING</span>
        </div>

        {/* Semantic Title (h2 to preserve single h1 invariant on root /) */}
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#f0f0f0] max-w-4xl mx-auto mb-6 leading-tight relative z-10">
          Developer Discovery &amp; Matchmaking
        </h2>

        {/* Descriptive Subtitle */}
        <p className="text-base sm:text-lg text-[#a0a0a0] max-w-2xl mx-auto leading-relaxed mb-8 relative z-10 font-normal">
          Find high-signal collaborators filtered by verified tech stacks, proof of work, and real-time compatibility scoring.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
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
      </section>

      {/* ── Assembled Landing Sections ─────────────────────────────── */}
      <PositioningBand />
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
              Multiplayer IDE with WebRTC operational transforms, shared cloud terminals, and synced previews.
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
