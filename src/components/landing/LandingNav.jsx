import React from "react";
import NotchNavbar from "../ui/notch-navbar";
import { OctoPairLogo } from "../brand/OctoPairLogo";

/**
 * LandingNav (Clean Sans Edition with exact labels)
 * 
 * - Labels: Explore / Rooms / Projects / Pricing
 * - Font: Sans
 * - Logo: Center only (no text)
 * - Removed theme toggle
 */
export const LandingNav = () => {
  const leftLinks = [
    { label: "Explore", href: "/features/feed" },
    { label: "Match", href: "/features/match" },
    { label: "Rooms", href: "/features/collab" },
  ];

  const rightLinks = [
    { label: "Projects", href: "/features/projects" },
    { label: "Pricing", href: "/pricing" },
  ];

  const logoNode = (
    <OctoPairLogo className="h-6 w-6 text-[#ccff00] transition-transform group-hover:scale-105" />
  );

  return (
    <NotchNavbar
      logo={logoNode}
      leftLinks={leftLinks}
      rightLinks={rightLinks}
      loginHref="/login"
      signupHref="/login?mode=signup"
    />
  );
};

export default LandingNav;
