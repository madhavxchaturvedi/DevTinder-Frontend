import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Sparkles,
  Terminal,
  Code2,
  FolderGit2,
  ChevronDown,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";
import { OctoPairLogo } from "../brand/OctoPairLogo";

/**
 * Feature catalog for Antigravity-style mega-menu dropdown
 */
export const FEATURE_DROPDOWN_ITEMS = [
  {
    title: "Swipe & Match",
    description: "Algorithmic developer pairing scored by tech stack overlap and proof of work",
    path: "/features/match",
    icon: Sparkles,
    accent: "#b266ff",
  },
  {
    title: "Live Room",
    description: "Sub-50ms multiplayer IDE with WebRTC audio/video mesh and cloud terminals",
    path: "/features/collab",
    icon: Terminal,
    accent: "#ccff00",
  },
  {
    title: "Developer Feed",
    description: "Interactive code snippets, sandboxed runtimes, and real-time Debug SOS radar",
    path: "/features/feed",
    icon: Code2,
    accent: "#ccff00",
  },
  {
    title: "Open Projects",
    description: "Curated open-source codebases, project rooms, and collaborative team sprints",
    path: "/features/projects",
    icon: FolderGit2,
    accent: "#b266ff",
  },
];

/**
 * LandingNav: Sticky Header with Desktop Mega-Menu & Mobile Navigation Drawer
 *
 * - Antigravity-style interactive mega-menu dropdown under "Features"
 * - Direct top-level navigation links to Pricing (/pricing) and Community (/community)
 * - Click-outside and Escape key dismissal with auto-close on navigation
 * - Active route indicator when pathname matches or starts with /features
 * - Mobile navigation drawer for viewports < 768px
 * - Unboxed OctoPair brand logo linking to /
 * - Strict adherence to pitch-black void (#09090b), card surfaces (#111113), and hairline borders
 * - Zero emojis (Lucide icons only)
 */
const LandingNav = () => {
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const pathname = location?.pathname || "";

  const isFeaturesActive = pathname.startsWith("/features");
  const isPricingActive = pathname === "/pricing";
  const isCommunityActive = pathname === "/community";

  // Dismiss dropdown on outside click or Escape key
  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setFeaturesOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setFeaturesOpen(false);
      }
    };

    if (featuresOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [featuresOpen]);

  // Auto-close open menus on route transition
  useEffect(() => {
    setFeaturesOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-md border-b border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* ── Brand Logo ─────────────────────────────────────────── */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ccff00] rounded-lg p-1"
          >
            <OctoPairLogo className="h-8 w-auto text-[#f0f0f0] group-hover:text-[#ccff00] transition-colors" />
            <span className="font-mono font-bold text-lg tracking-tight text-[#f0f0f0] group-hover:text-white transition-colors">
              OctoPair
            </span>
          </Link>

          {/* ── Desktop Navigation Links ───────────────────────────── */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 text-xs font-mono tracking-wide">
            {/* Features Mega-Menu Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                id="features-menu-button"
                aria-haspopup="true"
                aria-expanded={featuresOpen}
                aria-controls="features-dropdown"
                onClick={() => setFeaturesOpen((prev) => !prev)}
                className={`flex items-center gap-1.5 py-1 transition-colors duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#ccff00] rounded ${
                  isFeaturesActive || featuresOpen
                    ? "text-[#ccff00] font-semibold"
                    : "text-[#a0a0a0] hover:text-[#f0f0f0]"
                }`}
              >
                <span>Features</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    featuresOpen ? "rotate-180 text-[#ccff00]" : "text-[#a0a0a0]"
                  }`}
                />
              </button>

              {/* Mega-Menu Popover */}
              {featuresOpen && (
                <div
                  id="features-dropdown"
                  role="region"
                  aria-label="Features menu"
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[560px] lg:w-[620px] bg-[#111113] border border-white/10 rounded-xl p-4 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#52525b] mb-3 px-1">
                    Platform Capabilities
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {FEATURE_DROPDOWN_ITEMS.map((item) => {
                      const Icon = item.icon;
                      const isItemActive = pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setFeaturesOpen(false)}
                          className={`flex items-start gap-3 p-3 rounded-lg border transition-all group/item ${
                            isItemActive
                              ? "bg-white/[0.06] border-white/20"
                              : "bg-white/[0.02] hover:bg-white/[0.06] border-white/5 hover:border-white/15"
                          }`}
                        >
                          <div
                            className="p-2 rounded-md shrink-0 transition-transform group-hover/item:scale-105"
                            style={{
                              backgroundColor: `${item.accent}15`,
                              color: item.accent,
                              border: `1px solid ${item.accent}30`,
                            }}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-mono font-medium text-xs text-[#f0f0f0] group-hover/item:text-white flex items-center justify-between">
                              <span>{item.title}</span>
                              <ArrowRight className="w-3 h-3 text-[#52525b] group-hover/item:text-[#f0f0f0] group-hover/item:translate-x-0.5 transition-all opacity-0 group-hover/item:opacity-100" />
                            </div>
                            <p className="text-[11px] text-[#a0a0a0] leading-snug mt-1 font-sans line-clamp-2">
                              {item.description}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Direct Top-Level Pricing Link */}
            <Link
              to="/pricing"
              className={`py-1 transition-colors duration-150 ${
                isPricingActive
                  ? "text-[#ccff00] font-semibold"
                  : "text-[#a0a0a0] hover:text-[#f0f0f0]"
              }`}
            >
              Pricing
            </Link>

            {/* Direct Top-Level Community Link */}
            <Link
              to="/community"
              className={`py-1 transition-colors duration-150 ${
                isCommunityActive
                  ? "text-[#ccff00] font-semibold"
                  : "text-[#a0a0a0] hover:text-[#f0f0f0]"
              }`}
            >
              Community
            </Link>
          </div>

          {/* ── Desktop Action Buttons ─────────────────────────────── */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-mono text-[#a0a0a0] hover:text-[#f0f0f0] px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/login?mode=signup"
              className="bg-[#ccff00] hover:bg-[#d9ff33] text-black font-mono font-bold text-xs px-4 py-2 rounded-lg transition-all shadow-[0_0_15px_rgba(204,255,0,0.2)] hover:shadow-[0_0_20px_rgba(204,255,0,0.35)] flex items-center gap-1.5 active:scale-[0.98]"
            >
              <span>Start Pairing</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* ── Mobile Controls (Hamburger & Sign In) ───────────────── */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/login"
              className="text-xs font-mono text-[#f0f0f0] bg-white/5 px-2.5 py-1.5 rounded border border-white/10"
            >
              Sign In
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#a0a0a0] hover:text-white rounded-lg hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#ccff00]"
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Navigation Drawer ───────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#09090b]/98 backdrop-blur-xl px-4 pt-3 pb-6 flex flex-col gap-4 font-mono text-sm max-h-[85vh] overflow-y-auto">
          {/* Features Group */}
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-[#52525b] px-3 py-1 font-semibold">
              Features
            </div>
            <div className="grid grid-cols-1 gap-1">
              {FEATURE_DROPDOWN_ITEMS.map((item) => {
                const Icon = item.icon;
                const isItemActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors ${
                      isItemActive
                        ? "bg-white/10 text-[#ccff00]"
                        : "text-[#a0a0a0] hover:text-[#f0f0f0] hover:bg-white/5"
                    }`}
                  >
                    <div
                      className="p-1.5 rounded shrink-0"
                      style={{
                        backgroundColor: `${item.accent}15`,
                        color: item.accent,
                      }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-[#f0f0f0]">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-[#71717a] font-sans truncate">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Top Links */}
          <div className="pt-2 border-t border-white/10 flex flex-col gap-1">
            <Link
              to="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className={`py-2 px-3 rounded-lg text-xs transition-colors ${
                isPricingActive
                  ? "text-[#ccff00] bg-white/10"
                  : "text-[#a0a0a0] hover:text-[#f0f0f0] hover:bg-white/5"
              }`}
            >
              Pricing Plans
            </Link>
            <Link
              to="/community"
              onClick={() => setMobileMenuOpen(false)}
              className={`py-2 px-3 rounded-lg text-xs transition-colors ${
                isCommunityActive
                  ? "text-[#ccff00] bg-white/10"
                  : "text-[#a0a0a0] hover:text-[#f0f0f0] hover:bg-white/5"
              }`}
            >
              Community Telemetry
            </Link>
          </div>

          {/* Mobile Auth CTAs */}
          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center text-xs font-mono text-[#f0f0f0] bg-white/5 hover:bg-white/10 py-2.5 rounded-lg border border-white/10 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/login?mode=signup"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center bg-[#ccff00] hover:bg-[#d9ff33] text-black font-bold text-xs py-3 rounded-lg shadow-[0_0_15px_rgba(204,255,0,0.2)] transition-all flex items-center justify-center gap-1.5"
            >
              <span>Start Pairing Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default LandingNav;
