import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import AuroraHero from "../ui/aurora-hero";
import RadialGlowButton from "../ui/radial-glow-button";
import LiquidMetalButton from "../ui/liquid-metal";

/**
 * HeroSection (Vengeance UI Edition with Radial Glow & Liquid Metal)
 * 
 * - Primary CTA: Vengeance UI Radial Glow Button (white pill "Start building" with interactive cursor glow)
 * - Secondary CTA: Vengeance UI Liquid Metal Button ("See how it works" with animated fluid chrome border)
 * - Solid white headline (no gradient) & focused developer copy
 * - Understated microcopy below buttons
 */
const HeroSection = () => {
  const handleScrollToFeatures = (e) => {
    e.preventDefault();
    const target = document.getElementById("features") || document.getElementById("feature-teasers");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollBy({ top: window.innerHeight * 0.75, behavior: "smooth" });
    }
  };

  return (
    <AuroraHero className="pt-36 pb-28 sm:pt-44 sm:pb-36">
      {/* ── Solid White Headline with High-Contrast Shadow ───────────── */}
      <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.08] mb-5 drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
        Find your co-builder. Build it live.
      </h1>

      {/* ── Focused Subline ───────────────────────────────────────────── */}
      <p className="text-base sm:text-lg md:text-xl text-neutral-200 max-w-2xl mx-auto leading-relaxed font-normal mb-8 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
        Post what you&apos;re building. Find someone who fits your stack. Open a room and code together.
      </p>

      {/* ── Action Buttons: Radial Glow Button + Liquid Metal Button ──── */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 w-full sm:w-auto">
        {/* Primary: Radial Glow Button (White Pill) */}
        <Link to="/login?mode=signup" className="w-full sm:w-auto">
          <RadialGlowButton
            bg="bg-white"
            text="text-black"
            glowColor="rgba(255, 255, 255, 0.45)"
            borderColor="rgba(255, 255, 255, 0.7)"
            className="w-full sm:w-auto px-7 py-3 text-sm sm:text-base font-semibold"
          >
            <span>Start building</span>
          </RadialGlowButton>
        </Link>

        {/* Secondary: Liquid Metal Button (Animated Chrome / Metallic) */}
        <LiquidMetalButton
          onClick={handleScrollToFeatures}
          size="md"
          borderWidth={2.5}
          metalConfig={{
            colorBack: "#18181b",
            colorTint: "#f4f4f5",
            speed: 0.025,
          }}
          icon={<ArrowRight className="w-4 h-4 ml-0.5" />}
          className="w-full sm:w-auto"
        >
          <span>See how it works</span>
        </LiquidMetalButton>
      </div>

      {/* ── Understated Microcopy ──────────────────────────────────────── */}
      <p className="text-xs text-neutral-400 mt-5 font-normal tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
        Free to join. Rooms run in your browser.
      </p>
    </AuroraHero>
  );
};

export default HeroSection;
