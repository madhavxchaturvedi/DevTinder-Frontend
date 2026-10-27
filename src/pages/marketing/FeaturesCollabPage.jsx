import React from "react";
import { Link } from "react-router-dom";
import { Terminal, ArrowRight, ArrowLeft } from "lucide-react";

import RoomFeaturesSection from "../../components/landing/RoomFeaturesSection";
import FeatureBentoGrid from "../../components/landing/FeatureBentoGrid";
import WatchSessionSection from "../../components/landing/WatchSessionSection";
import FinalCtaSection from "../../components/landing/FinalCtaSection";

/**
 * FeaturesCollabPage (/features/collab)
 *
 * Dedicated marketing sub-page for Sub-50ms Live Collaboration & Real-Time Multiplayer IDE.
 * Assembles:
 * - Hero header with Terminal eyebrow badge, back navigation, and action CTAs
 * - RoomFeaturesSection: Scripted browser mockup & 12 platform capabilities
 * - FeatureBentoGrid: 5-card bento grid (WebRTC engine, cloud terminal, canvas, proof of work)
 * - WatchSessionSection: Looping interactive session tiles with multiplayer cursor tracking
 * - Inter-feature CTA link to /features/feed
 * - Closing signup CTA banner routing to /login?mode=signup
 */
const FeaturesCollabPage = () => {
  return (
    <div className="w-full bg-[#09090b] text-[#f0f0f0] overflow-x-hidden">
      {/* ── Hero Header ────────────────────────────────────────────── */}
      <section className="relative w-full pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Ambient Top Glow */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] max-w-full h-[280px] bg-[#ccff00]/[0.07] blur-[130px] pointer-events-none rounded-full"
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
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/25 text-xs font-mono text-[#ccff00] uppercase tracking-wider mb-6 relative z-10">
          <Terminal className="w-3.5 h-3.5" />
          <span>REAL-TIME MULTIPLAYER IDE</span>
        </div>

        {/* Semantic Title (h2 to preserve single h1 invariant on root /) */}
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#f0f0f0] max-w-4xl mx-auto mb-6 leading-tight relative z-10">
          Sub-50ms Live Collaboration
        </h2>

        {/* Descriptive Subtitle */}
        <p className="text-base sm:text-lg text-[#a0a0a0] max-w-2xl mx-auto leading-relaxed mb-8 relative z-10 font-normal">
          Experience zero-latency peer programming with WebRTC operational transforms, shared cloud terminals, and synchronized previews.
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
            to="/features/feed"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-[#f0f0f0] transition-colors inline-flex items-center justify-center gap-2"
          >
            <span>Explore Developer Feed</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* ── Assembled Landing Sections ─────────────────────────────── */}
      <RoomFeaturesSection />
      <FeatureBentoGrid />
      <WatchSessionSection />

      {/* ── Inter-Feature Navigation CTA ───────────────────────────── */}
      <section className="relative w-full py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="p-6 sm:p-8 rounded-2xl bg-[#111113] border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <span className="text-[11px] font-mono text-[#a0a0a0] uppercase tracking-wider block mb-1">
              Next Capability
            </span>
            <h3 className="text-xl font-bold text-[#f0f0f0]">
              Interactive Code Feed &amp; Debug SOS
            </h3>
            <p className="text-xs text-[#a0a0a0] mt-1">
              Sandboxed in-browser code execution, community discussions, and urgent debug radar broadcasts.
            </p>
          </div>
          <Link
            to="/features/feed"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-mono font-semibold text-[#f0f0f0] border border-white/15 transition-all group shrink-0"
          >
            <span>Explore Developer Feed</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* ── Closing Banner CTA ─────────────────────────────────────── */}
      <FinalCtaSection />
    </div>
  );
};

export default FeaturesCollabPage;
