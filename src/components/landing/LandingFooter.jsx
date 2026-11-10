import React from "react";
import { Link } from "react-router-dom";
import { Github, Twitter, MessageSquare } from "lucide-react";
import { OctoPairLogo } from "../brand/OctoPairLogo";
import { AnimatedFooter } from "../ui/animated-footer";

/**
 * Feature F27: Vengeance UI Animated Footer & Developer Navigation
 * 
 * - Real external social links: GitHub, X (Twitter), Discord
 * - Real legal internal links: /privacy and /terms
 * - Dynamic ASCII art hands rendered via dual HTML5 canvases with cursor hover cluster ripples
 * - Soft parallax drift reacting to mouse movement
 * - Scroll-reveal unmasking character-by-character for "<OctoPair />"
 * - Brand lime (#ccff00) reactive cell highlight on dark void (#09090b)
 */
const LandingFooter = () => {
  return (
    <AnimatedFooter
      headingLines={["<OctoPair />"]}
      leftImage="/animated-footer/hand-left.jpg"
      rightImage="/animated-footer/hand-right.jpg"
      background="#09090b"
      textColor="#ffffff"
      leftCharColor="#ccff00"
      rightCharColor="#b266ff"
      leftHoverColor="#ccff00"
      rightHoverColor="#b266ff"
      hoverCharColor="#09090b"
      titleClassName="bg-gradient-to-b from-white/25 via-white/10 to-white/[0.02] bg-clip-text text-transparent opacity-80"
      className="border-t border-white/10 pt-16"
      bottomContent={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 border-t border-white/[0.07] flex flex-col md:flex-row flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#71717a]">
            <p className="shrink-0 text-center md:text-left">
              © 2026 OctoPair. Built for real-time collaboration.
            </p>
            <p className="shrink-0 text-center md:text-right">
              Instant, real-time code synchronization.
            </p>
          </div>
        </div>
      }
    >
      {/* ── Main Footer Navigation ─────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2 group inline-flex relative z-10 hover:z-20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#ccff00] rounded-md">
              <OctoPairLogo className="h-7 w-auto text-[#f0f0f0] group-hover:text-[#ccff00] transition-colors" />
              <span className="font-mono font-bold text-lg text-[#f0f0f0] group-hover:text-white transition-colors">
                OctoPair
              </span>
            </Link>
            <p className="text-xs text-[#a0a0a0] max-w-sm leading-relaxed">
              The high-performance multiplayer IDE for builders. Pair program with real-time sync, zero local installation, and verified proof of work.
            </p>
            <div className="flex items-center gap-4 pt-2 relative z-10">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="relative z-10 p-2 rounded-lg bg-white/5 border border-white/10 text-[#a0a0a0] hover:text-[#ccff00] hover:border-[#ccff00]/40 hover:bg-white/10 hover:scale-105 hover:z-20 transition-all duration-150 inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#ccff00]"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="relative z-10 p-2 rounded-lg bg-white/5 border border-white/10 text-[#a0a0a0] hover:text-[#ccff00] hover:border-[#ccff00]/40 hover:bg-white/10 hover:scale-105 hover:z-20 transition-all duration-150 inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#ccff00]"
                aria-label="X (formerly Twitter)"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                className="relative z-10 p-2 rounded-lg bg-white/5 border border-white/10 text-[#a0a0a0] hover:text-[#ccff00] hover:border-[#ccff00]/40 hover:bg-white/10 hover:scale-105 hover:z-20 transition-all duration-150 inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#ccff00]"
                aria-label="Discord"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Canonical Product Routes */}
          <div className="space-y-3 font-mono text-xs">
            <p className="text-[#52525b] uppercase tracking-wider font-semibold">
              Product
            </p>
            <ul className="space-y-2.5 text-[#a0a0a0]">
              <li>
                <Link to="/features/match" className="inline-block relative z-10 hover:z-20 hover:text-white hover:translate-x-0.5 focus-visible:outline-none focus-visible:text-white focus-visible:translate-x-0.5 focus-visible:ring-1 focus-visible:ring-[#ccff00]/60 rounded-sm transition-all duration-150">
                  Developer Matching
                </Link>
              </li>
              <li>
                <Link to="/features/collab" className="inline-block relative z-10 hover:z-20 hover:text-white hover:translate-x-0.5 focus-visible:outline-none focus-visible:text-white focus-visible:translate-x-0.5 focus-visible:ring-1 focus-visible:ring-[#ccff00]/60 rounded-sm transition-all duration-150">
                  Live Collaboration
                </Link>
              </li>
              <li>
                <Link to="/features/feed" className="inline-block relative z-10 hover:z-20 hover:text-white hover:translate-x-0.5 focus-visible:outline-none focus-visible:text-white focus-visible:translate-x-0.5 focus-visible:ring-1 focus-visible:ring-[#ccff00]/60 rounded-sm transition-all duration-150">
                  Developer Feed
                </Link>
              </li>
              <li>
                <Link to="/features/projects" className="inline-block relative z-10 hover:z-20 hover:text-white hover:translate-x-0.5 focus-visible:outline-none focus-visible:text-white focus-visible:translate-x-0.5 focus-visible:ring-1 focus-visible:ring-[#ccff00]/60 rounded-sm transition-all duration-150">
                  Open Projects
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="inline-block relative z-10 hover:z-20 hover:text-white hover:translate-x-0.5 focus-visible:outline-none focus-visible:text-white focus-visible:translate-x-0.5 focus-visible:ring-1 focus-visible:ring-[#ccff00]/60 rounded-sm transition-all duration-150">
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link to="/pricing#faq" className="inline-block relative z-10 hover:z-20 hover:text-white hover:translate-x-0.5 focus-visible:outline-none focus-visible:text-white focus-visible:translate-x-0.5 focus-visible:ring-1 focus-visible:ring-[#ccff00]/60 rounded-sm transition-all duration-150">
                  Technical FAQ
                </Link>
              </li>
              <li>
                <Link to="/community" className="inline-block relative z-10 hover:z-20 hover:text-white hover:translate-x-0.5 focus-visible:outline-none focus-visible:text-white focus-visible:translate-x-0.5 focus-visible:ring-1 focus-visible:ring-[#ccff00]/60 rounded-sm transition-all duration-150">
                  Community
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Auth Links */}
          <div className="space-y-3 font-mono text-xs">
            <p className="text-[#52525b] uppercase tracking-wider font-semibold">
              Legal & Platform
            </p>
            <ul className="space-y-2.5 text-[#a0a0a0]">
              <li>
                <Link to="/privacy" className="inline-block relative z-10 hover:z-20 hover:text-white hover:translate-x-0.5 focus-visible:outline-none focus-visible:text-white focus-visible:translate-x-0.5 focus-visible:ring-1 focus-visible:ring-[#ccff00]/60 rounded-sm transition-all duration-150">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="inline-block relative z-10 hover:z-20 hover:text-white hover:translate-x-0.5 focus-visible:outline-none focus-visible:text-white focus-visible:translate-x-0.5 focus-visible:ring-1 focus-visible:ring-[#ccff00]/60 rounded-sm transition-all duration-150">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/login" className="inline-block relative z-10 hover:z-20 hover:text-white hover:translate-x-0.5 focus-visible:outline-none focus-visible:text-white focus-visible:translate-x-0.5 focus-visible:ring-1 focus-visible:ring-[#ccff00]/60 rounded-sm transition-all duration-150">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/login?mode=signup" className="inline-block relative z-10 hover:z-20 hover:text-white hover:translate-x-0.5 focus-visible:outline-none focus-visible:text-white focus-visible:translate-x-0.5 focus-visible:ring-1 focus-visible:ring-[#ccff00]/60 rounded-sm transition-all duration-150">
                  Start Pairing
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </AnimatedFooter>
  );
};

export default LandingFooter;
