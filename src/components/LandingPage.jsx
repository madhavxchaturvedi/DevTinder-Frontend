import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import LandingShell from "./landing/LandingShell";
import HeroSection from "./landing/HeroSection";
import TechMarquee from "./landing/TechMarquee";
import WhyUsBentoGrid from "./ui/why-us-bento-grid";
import DeveloperServiceBento from "./ui/developer-service-bento";
import FinalCtaSection from "./landing/FinalCtaSection";

/**
 * DevTinder Modern Vengeance UI Landing Page
 *
 * 1. HeroSection: 3D Twisting Ribbon background, solid white headline, Radial Glow + Liquid Metal buttons
 * 2. TechMarquee: Clean transition divider with infinite marquee of 16+ languages & runtimes
 * 3. WhyUsBentoGrid: Vengeance UI 5-panel interactive bento grid (Live peer sync, 3-step pipeline, stack synergy, snippet feed, proof of work)
 * 4. FinalCtaSection: Closing action banner
 */
const LandingPage = ({ wrapInShell = false }) => {
  const user = useSelector((store) => store.user);
  const isAuthHint = typeof window !== "undefined" && (
    localStorage.getItem("octopair_auth_hint") === "true" ||
    localStorage.getItem("devtinder_auth_hint") === "true" ||
    localStorage.getItem("octopair_auth") === "1" ||
    localStorage.getItem("devtinder_auth") === "1" ||
    (document.cookie && document.cookie.includes("auth_hint=true")) ||
    Boolean(user)
  );

  if (isAuthHint) {
    try {
      sessionStorage.setItem("octopair_from_root", "1");
    } catch {}
    return <Navigate to="/feed" replace />;
  }

  const sections = (
    <div className="w-full bg-[#09090b] text-[#f0f0f0] overflow-x-clip">
      {/* ── 1. Hero Section ────────────────────────────────────────── */}
      <HeroSection />

      {/* ── Transition Divider: Tech Stack Marquee ──────────────────── */}
      <TechMarquee />

      {/* ── 2. Why Us Bento Grid (Vengeance UI 5-Panel Layout) ─────── */}
      <WhyUsBentoGrid />

      {/* ── 3. Developer Service Bento (Screenshot-Accurate Edition) ── */}
      <DeveloperServiceBento />

      {/* ── Closing CTA ────────────────────────────────────────────── */}
      <FinalCtaSection />
    </div>
  );

  if (!wrapInShell) {
    return sections;
  }

  return (
    <LandingShell>
      {sections}
    </LandingShell>
  );
};

export default LandingPage;
