import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Sparkles, ArrowRight, Zap, ShieldCheck } from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";

/**
 * Feature: OctoPair Pricing Section
 * 
 * - id="pricing"
 * - Pitch-black background (#09090b)
 * - Card surfaces (#111113) with hairline borders (border-white/10)
 * - 2-tier layout: Free ($0) vs Pro ($9/mo, $90/yr with "Save 17%")
 * - Monthly / Annual toggle pill with animated price transition
 * - Ghost CTA button for Free routing to /login?mode=signup&plan=free
 * - Glowing lime CTA button for Pro routing to /login?mode=signup&plan=pro
 * - Purple Border Beam (#b266ff) on Pro card
 */
const PricingSection = () => {
  const [billingCycle, setBillingCycle] = useState("monthly"); // "monthly" | "annual"
  const isAnnual = billingCycle === "annual";

  const freeFeatures = [
    "Community feed & project posts",
    "Explore developer network graph",
    "Mutual connections & direct chat",
    "Instant Debug SOS alerts",
    "Unlimited project join requests",
    "1 active project room",
    "Complete workspace ZIP export",
  ];

  const proFeatures = [
    "Everything included in Free",
    "Unlimited active project rooms",
    "Priority algorithmic matching",
    "Verified Pro developer badge",
    "Instant priority Debug SOS ranking",
    "Direct priority messaging with builders",
  ];

  return (
    <section
      id="pricing"
      className="relative w-full py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-[#09090b] text-[#f0f0f0]"
    >
      {/* ── Section Header ─────────────────────────────────────────── */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#b266ff]/10 border border-[#b266ff]/25 text-xs font-mono text-[#b266ff] uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Simple, Developer-First Pricing</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#f0f0f0] mb-4">
          Pair free today. Scale to <span className="text-[#ccff00]">Pro</span> as you ship.
        </h2>
        <p className="text-sm sm:text-base text-[#a0a0a0] max-w-2xl mx-auto leading-relaxed">
          Zero surprise fees. Build collaboratively in real-time cloud containers with transparent USD pricing.
        </p>

        {/* ── Monthly / Annual Toggle Pill ─────────────────────────── */}
        <div className="mt-8 inline-flex items-center p-1 rounded-full bg-[#111113] border border-white/10 shadow-inner">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`px-5 py-2 rounded-full text-xs font-mono transition-all duration-200 cursor-pointer ${
              !isAnnual
                ? "bg-white/10 text-white font-bold shadow-[0_0_12px_rgba(255,255,255,0.08)]"
                : "text-[#a0a0a0] hover:text-white"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("annual")}
            className={`px-5 py-2 rounded-full text-xs font-mono transition-all duration-200 flex items-center gap-2 cursor-pointer ${
              isAnnual
                ? "bg-white/10 text-white font-bold shadow-[0_0_12px_rgba(255,255,255,0.08)]"
                : "text-[#a0a0a0] hover:text-white"
            }`}
          >
            <span>Annual</span>
            <span className="bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Save 17%
            </span>
          </button>
        </div>
      </div>

      {/* ── 2-Tier Pricing Cards Grid ───────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
        {/* ── 1. Free Tier Card ─────────────────────────────────────── */}
        <div className="rounded-2xl bg-[#111113] border border-white/10 p-8 flex flex-col justify-between transition-all duration-300 hover:border-white/20 shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[11px] font-mono text-[#a0a0a0] uppercase tracking-wider">
                  STARTER
                </span>
                <h3 className="text-2xl font-bold text-[#f0f0f0] tracking-tight mt-0.5">
                  Free
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[#a0a0a0]">
                <Zap className="w-5 h-5" />
              </div>
            </div>

            <p className="text-xs text-[#a0a0a0] leading-relaxed mb-6 min-h-[36px]">
              Complete access to find collaborators, post projects, chat, and run your first active room.
            </p>

            {/* Price display */}
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#f0f0f0]">
                $0
              </span>
              <span className="text-xs font-mono text-[#a0a0a0]">/ forever</span>
            </div>

            <div className="h-px bg-white/10 my-6" />

            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#a0a0a0] mb-4">
              What's Included:
            </div>

            <ul className="space-y-3 text-xs mb-8">
              {freeFeatures.map((feat) => (
                <li key={feat} className="flex items-start gap-2.5 text-[#d4d4d8]">
                  <Check className="w-4 h-4 text-[#ccff00] shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t border-white/[0.06]">
            <Link
              to="/login?mode=signup&plan=free"
              className="w-full py-3 px-5 rounded-xl border border-white/20 text-[#f0f0f0] hover:text-white hover:bg-white/5 hover:border-white/40 font-mono font-bold text-xs tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 group active:scale-[0.98]"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 text-[#a0a0a0] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>

        {/* ── 2. Pro Tier Card (Styled with Purple Border Beam) ─────── */}
        <div className="rounded-2xl bg-[#111113] border border-[#b266ff]/40 p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:border-[#b266ff]/70 shadow-[0_0_40px_rgba(178,102,255,0.15)] hover:shadow-[0_0_50px_rgba(178,102,255,0.25)]">
          {/* Purple Border Beam / Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#b266ff]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#ccff00]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#b266ff] to-transparent" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#b266ff]/15 text-[#b266ff] border border-[#b266ff]/35 mb-2 w-fit">
                  <Sparkles className="w-3 h-3 text-[#b266ff]" />
                  <span>MOST POPULAR</span>
                </div>
                <h3 className="text-2xl font-bold text-[#f0f0f0] tracking-tight">
                  Pro
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-[#b266ff]/15 border border-[#b266ff]/30 text-[#b266ff]">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            <p className="text-xs text-[#a0a0a0] leading-relaxed mb-6 min-h-[36px]">
              Unlimited collaborative workspaces, priority matching in community feeds, and verified status.
            </p>

            {/* Animated Price display */}
            <div className="flex items-baseline gap-2 mb-2">
              <AnimatePresence mode="wait">
                <Motion.span
                  key={isAnnual ? "pro-annual" : "pro-monthly"}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#f0f0f0]"
                >
                  {isAnnual ? "$90" : "$9"}
                </Motion.span>
              </AnimatePresence>
              <span className="text-xs font-mono text-[#a0a0a0]">
                {isAnnual ? "/ year" : "/ month"}
              </span>
            </div>

            <div className="text-[11px] font-mono text-[#ccff00] h-5 mb-4">
              {isAnnual ? "Billed annually ($7.50/mo) - Save 17%" : "Billed monthly - Cancel anytime"}
            </div>

            <div className="h-px bg-white/10 my-4" />

            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#b266ff] mb-4">
              Everything in Free, plus:
            </div>

            <ul className="space-y-3 text-xs mb-8">
              {proFeatures.map((feat, idx) => (
                <li key={feat} className="flex items-start gap-2.5 text-[#f0f0f0]">
                  <Check className="w-4 h-4 text-[#ccff00] shrink-0 mt-0.5" />
                  <span className={idx === 1 ? "font-bold text-white underline decoration-[#ccff00]/60 underline-offset-2" : ""}>
                    {feat}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t border-white/[0.06] relative z-10">
            <Link
              to="/login?mode=signup&plan=pro"
              className="w-full py-3 px-5 rounded-xl bg-[#ccff00] hover:bg-[#d9ff33] text-black font-mono font-bold text-xs tracking-wider uppercase transition-all duration-200 shadow-[0_0_25px_rgba(204,255,0,0.25)] hover:shadow-[0_0_35px_rgba(204,255,0,0.4)] flex items-center justify-center gap-2 group active:scale-[0.98]"
            >
              <span>Upgrade to Pro</span>
              <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
