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
 * Visual Archetype: Decision Matrix
 * Features:
 * - Consolidated single-hero architecture: eliminates redundant outer banner
 * - Unified header with breadcrumb, ShieldCheck eyebrow badge, and primary h1
 * - Seamless integration with PricingSection (passing hideHeader={true} to eliminate duplicate headers)
 * - Monthly / Annual interactive toggle and 2-tier comparison card with glowing Vengeance border beam
 * - FaqSection: 11 accessible developer technical FAQs
 * - Direct link to /community and closing signup CTA banner routing to /login?mode=signup
 */
const PricingDestinationPage = () => {
  return (
    <div className="w-full bg-[#09090b] text-[#f0f0f0] overflow-x-clip">
      {/* ── Consolidated Single-Hero Architecture ──────────────────── */}
      <section className="relative w-full pt-16 pb-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Ambient Top Glow */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[650px] max-w-full h-[300px] bg-[#b266ff]/[0.08] blur-[140px] pointer-events-none rounded-full"
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

        {/* Primary Semantic Title (h1) */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#f0f0f0] max-w-4xl mx-auto mb-4 leading-tight relative z-10">
          Simple, Predictable Plans for Developers
        </h1>

        {/* Descriptive Subtitle */}
        <p className="text-base sm:text-lg text-[#a0a0a0] max-w-2xl mx-auto leading-relaxed mb-6 relative z-10 font-normal">
          Start pairing for free today. Upgrade to <span className="text-[#ccff00] font-semibold">Pro</span> for unlimited active project rooms, priority matching, and verified builder credentials.
        </p>

        {/* Quick Link to Community Telemetry */}
        <div className="flex items-center justify-center gap-4 relative z-10 mb-2">
          <Link
            to="/community"
            className="text-xs font-mono text-[#a0a0a0] hover:text-[#ccff00] transition-colors inline-flex items-center gap-1.5"
          >
            <span>Need team telemetry or builder network stats? Explore Community</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* ── Assembled Pricing Grid (Single-Hero Decision Matrix) ───── */}
      <PricingSection hideHeader={true} />

      {/* ── Frequently Asked Questions ─────────────────────────────── */}
      <FaqSection />

      {/* ── Closing Banner CTA ─────────────────────────────────────── */}
      <FinalCtaSection />
    </div>
  );
};

export default PricingDestinationPage;
