import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import LandingNav from "./LandingNav";
import LandingFooter from "./LandingFooter";

/**
 * LandingShell: Unified Marketing Layout Shell
 *
 * Wraps all marketing destinations with:
 * - Sticky mega-menu navbar (LandingNav)
 * - Page content slot (<Outlet /> or children)
 * - Canonical shared marketing footer (LandingFooter)
 * - Automatic scroll restoration to (0, 0) on route change
 * - Design system void: #09090b with selection #ccff00
 */
const LandingShell = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [location?.pathname]);

  return (
    <div className="w-full min-h-screen bg-[#09090b] text-[#f0f0f0] font-sans selection:bg-[#ccff00] selection:text-black overflow-x-hidden flex flex-col justify-between">
      {/* Sticky Header with Desktop Mega-Menu & Mobile Drawer */}
      <LandingNav />

      {/* Dynamic Route Content */}
      <main className="flex-1 w-full">
        {children || <Outlet />}
      </main>

      {/* Global Clipped Branding Footer */}
      <LandingFooter />
    </div>
  );
};

export default LandingShell;
