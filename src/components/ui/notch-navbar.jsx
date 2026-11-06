import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Notch Navbar (Clean Sans Edition)
 * 
 * - Pinned to the top edge (top-0) with smooth concave transition ears
 * - Exact center contains ONLY the brand logo icon (no text)
 * - Sans font throughout (font-sans)
 * - Clean labels: Explore, Rooms, Projects, Pricing
 * - Removed theme toggle per instruction
 * - Log in link & solid white Sign up pill
 */
export const NotchNavbar = ({
  logo,
  leftLinks = [],
  rightLinks = [],
  loginHref = "/login",
  signupHref = "/login?mode=signup",
  className,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <header className={cn("fixed top-0 inset-x-0 z-50 flex justify-center pointer-events-none px-4", className)}>
      <nav
        aria-label="Main Navigation"
        className="pointer-events-auto relative flex items-center justify-between h-12 sm:h-13 px-4 sm:px-6 bg-black/95 text-white backdrop-blur-xl border-b border-x border-white/10 rounded-b-2xl shadow-[0_12px_32px_rgba(0,0,0,0.7)] max-w-4xl w-full font-sans"
      >
        {/* ── Left Smooth Concave Ear / Fillet ───────────────────────── */}
        <div aria-hidden="true" className="absolute -left-5 top-0 w-5 h-5 pointer-events-none overflow-hidden">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            className="text-black/95 fill-current w-full h-full"
          >
            <path d="M0 0 C10 0 20 5 20 20 V0 H0 Z" />
          </svg>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            className="stroke-white/10 fill-none w-full h-full absolute inset-0"
          >
            <path d="M0 0 C10 0 20 5 20 20" strokeWidth="1" />
          </svg>
        </div>

        {/* ── Right Smooth Concave Ear / Fillet ──────────────────────── */}
        <div aria-hidden="true" className="absolute -right-5 top-0 w-5 h-5 pointer-events-none overflow-hidden">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            className="text-black/95 fill-current w-full h-full"
          >
            <path d="M0 20 C0 5 10 0 20 0 H0 V20 Z" />
          </svg>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            className="stroke-white/10 fill-none w-full h-full absolute inset-0"
          >
            <path d="M0 20 C0 5 10 0 20 0" strokeWidth="1" />
          </svg>
        </div>

        {/* ── Left Wing Links (Desktop - Sans Font) ───────────────────── */}
        <div className="hidden md:flex items-center gap-6 text-xs sm:text-[13px] font-medium text-neutral-300">
          {leftLinks.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.label}
                to={link.href}
                className={cn(
                  "hover:text-white transition-colors py-1",
                  isActive && "text-white font-semibold"
                )}
              >
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* ── Exact Center: ONLY Logo (No Text) ───────────────────────── */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex items-center justify-center">
          <Link
            to="/"
            className="p-1.5 rounded-xl hover:bg-white/5 transition-all group flex items-center justify-center"
            aria-label="OctoPair Home"
          >
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-[#ccff00]/15 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              {logo}
            </div>
          </Link>
        </div>

        {/* ── Right Wing Links & Controls (Desktop - Sans Font) ──────── */}
        <div className="hidden md:flex items-center gap-5 text-xs sm:text-[13px]">
          {rightLinks.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.label}
                to={link.href}
                className={cn(
                  "text-neutral-300 hover:text-white transition-colors font-medium",
                  isActive && "text-white font-semibold"
                )}
              >
                <span>{link.label}</span>
              </Link>
            );
          })}

          {/* Subtle Vertical Divider */}
          <span className="h-3.5 w-px bg-white/15 ml-1" />

          {/* Log in text link */}
          <Link
            to={loginHref}
            className="text-neutral-300 hover:text-white transition-colors font-medium"
          >
            Log in
          </Link>

          {/* White Sign up Pill Button */}
          <Link
            to={signupHref}
            className="px-4 py-1.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-neutral-200 shadow-sm transition-all active:scale-95"
          >
            Sign up
          </Link>
        </div>

        {/* ── Mobile View Controls ───────────────────────────────────── */}
        <div className="flex md:hidden items-center justify-between w-full">
          {/* Spacer on left so center logo stays perfectly centered */}
          <div className="w-8" />
          
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* ── Mobile Dropdown Drawer ─────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto absolute top-14 inset-x-4 max-w-sm mx-auto rounded-2xl bg-black/95 border border-white/10 backdrop-blur-2xl p-5 shadow-2xl flex flex-col gap-4 z-50 font-sans"
          >
            <div className="flex flex-col gap-2.5 text-sm">
              <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">
                Menu
              </span>
              {leftLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-1 text-neutral-300 hover:text-white transition-colors font-medium"
                >
                  {link.label}
                </Link>
              ))}
              {rightLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-1 text-neutral-300 hover:text-white transition-colors font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              <Link
                to={loginHref}
                onClick={() => setMobileOpen(false)}
                className="w-full text-center py-2 rounded-xl text-neutral-200 bg-white/5 border border-white/10 font-medium text-xs hover:bg-white/10 transition-colors"
              >
                Log in
              </Link>
              <Link
                to={signupHref}
                onClick={() => setMobileOpen(false)}
                className="w-full text-center py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all"
              >
                Sign up
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default NotchNavbar;
