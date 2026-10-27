import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ArrowRight, ArrowLeft } from "lucide-react";

import PricingSection from "../../components/landing/PricingSection";
import FaqSection from "../../components/landing/FaqSection";
import FinalCtaSection from "../../components/landing/FinalCtaSection";

/**
 * PricingDestinationPage (/pricing)
 *
 * Dedicated marketing destination page for Transparent Developer Pricing.
 * Assembles:
 * - Hero header with ShieldCheck eyebrow badge, back navigation, and action CTAs
 * - PricingSection: 2-tier monthly/annual toggle (Free $0 vs Pro $9/mo) with animated beam
 * - FaqSection: 11 accessible technical developer FAQs
 * - Closing signup CTA banner routing to /login?mode=signup
 */
const PricingDestinationPage = () => {
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
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>TRANSPARENT PRICING</span>
        </div>

        {/* Semantic Title (h2 to preserve single h1 invariant on root /) */}
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#f0f0f0] max-w-4xl mx-auto mb-6 leading-tight relative z-10">
          Simple, Predictable Plans for Developers
        </h2>

        {/* Descriptive Subtitle */}
        <p className="text-base sm:text-lg text-[#a0a0a0] max-w-2xl mx-auto leading-relaxed mb-8 relative z-10 font-normal">
          Start pairing for free today. Upgrade to Pro for unlimited active project rooms, priority matching, and verified builder credentials.
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
            to="/community"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-[#f0f0f0] transition-colors inline-flex items-center justify-center gap-2"
          >
            <span>Explore Community &amp; Telemetry</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* ── Assembled Pricing Grid & FAQs ──────────────────────────── */}
      <PricingSection />
      <FaqSection />

      {/* ── Closing Banner CTA ─────────────────────────────────────── */}
      <FinalCtaSection />
    </div>
  );
};

export default PricingDestinationPage;
