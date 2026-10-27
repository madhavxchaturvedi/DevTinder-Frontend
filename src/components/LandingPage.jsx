import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import LandingShell from "./landing/LandingShell";
import HeroSection from "./landing/HeroSection";
import TechMarquee from "./landing/TechMarquee";
import FeatureTeasersSection from "./landing/FeatureTeasersSection";
import PositioningBand from "./landing/PositioningBand";
import FinalCtaSection from "./landing/FinalCtaSection";

/**
 * OctoPair Streamlined Main Hub Landing Page
 *
 * Streamlined root `/` overview with 5 focused sections:
 * 1. HeroSection (Single h1 headline, HeroMockEditor with MultiplayerCursor, SendToLaptopButton)
 * 2. TechMarquee (16+ languages and runtimes infinite marquee)
 * 3. FeatureTeasersSection (4-card interactive preview grid linking to /features/* sub-pages)
 * 4. PositioningBand (3 core value pillars: Sub-50ms Peer Sync, Curated Project Graph, Verified Proof of Work)
 * 5. FinalCtaSection (Closing high-impact banner routing to /login?mode=signup)
 *
 * Wrapped in LandingShell which hosts LandingNav, dynamic main container, and LandingFooter.
 * Retains synchronous isAuthHint check redirecting authenticated developers directly to /feed.
 */
const LandingPage = ({ wrapInShell = true }) => {
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
    <div className="w-full bg-[#09090b] text-[#f0f0f0] overflow-x-hidden">
      {/* ── 1. Hero Section ────────────────────────────────────────── */}
      <HeroSection />

      {/* ── 2. Tech Stack Marquee ──────────────────────────────────── */}
      <TechMarquee />

      {/* ── 3. Feature Teasers Grid ────────────────────────────────── */}
      <FeatureTeasersSection />

      {/* ── 4. Positioning Band (3 Value Pillars) ──────────────────── */}
      <PositioningBand />

      {/* ── 5. Final Call To Action ───────────────────────────────── */}
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
