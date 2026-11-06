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
      if (location?.hash) {
        const targetId = location.hash.replace(/^#/, "");
        let attempts = 0;
        const maxAttempts = 8;
        let timerId;

        const tryScroll = () => {
          const el = document.getElementById(targetId);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          } else if (attempts < maxAttempts) {
            attempts++;
            timerId = setTimeout(tryScroll, 50);
          }
        };

        // Frame delay to allow lazy / Suspense route components to commit DOM
        timerId = setTimeout(tryScroll, 60);

        return () => {
          if (timerId) clearTimeout(timerId);
        };
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }
    }
  }, [location?.pathname, location?.hash]);

  // overflow-x-hidden upgraded to overflow-x-clip to prevent breaking sticky positioning
  return (
    <div className="w-full min-h-screen bg-[#09090b] text-[#f0f0f0] font-sans selection:bg-[#ccff00] selection:text-black overflow-x-clip flex flex-col justify-between">
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
