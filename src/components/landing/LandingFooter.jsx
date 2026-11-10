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
      charColor="#3f3f46"
      hoverColor="#ccff00"
      hoverCharColor="#09090b"
      className="border-t border-white/10 pt-16"
    >
      {/* ── Main Footer Navigation ─────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2 group inline-flex">
              <OctoPairLogo className="h-7 w-auto text-[#f0f0f0] group-hover:text-[#ccff00] transition-colors" />
              <span className="font-mono font-bold text-lg text-[#f0f0f0] group-hover:text-white transition-colors">
                OctoPair
              </span>
            </Link>
            <p className="text-xs text-[#a0a0a0] max-w-sm leading-relaxed">
              The high-performance multiplayer IDE for builders. Pair program with real-time sync, zero local installation, and verified proof of work.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-[#a0a0a0] hover:text-[#ccff00] hover:border-[#ccff00]/40 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-[#a0a0a0] hover:text-[#ccff00] hover:border-[#ccff00]/40 transition-colors"
                aria-label="X (formerly Twitter)"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-[#a0a0a0] hover:text-[#ccff00] hover:border-[#ccff00]/40 transition-colors"
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
            <ul className="space-y-2 text-[#a0a0a0]">
              <li>
                <Link to="/features/match" className="hover:text-white transition-colors">
                  Developer Matching
                </Link>
              </li>
              <li>
                <Link to="/features/collab" className="hover:text-white transition-colors">
                  Live Collaboration
                </Link>
              </li>
              <li>
                <Link to="/features/feed" className="hover:text-white transition-colors">
                  Developer Feed
                </Link>
              </li>
              <li>
                <Link to="/features/projects" className="hover:text-white transition-colors">
                  Open Projects
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-white transition-colors">
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link to="/pricing#faq" className="hover:text-white transition-colors">
                  Technical FAQ
                </Link>
              </li>
              <li>
                <Link to="/community" className="hover:text-white transition-colors">
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
            <ul className="space-y-2 text-[#a0a0a0]">
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/login?mode=signup" className="hover:text-white transition-colors">
                  Start Pairing
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/[0.07] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#52525b]">
          <p>© {new Date().getFullYear()} OctoPair. Built for real-time collaboration.</p>
          <p>Instant, real-time code synchronization.</p>
        </div>
      </div>
    </AnimatedFooter>
  );
};

export default LandingFooter;
