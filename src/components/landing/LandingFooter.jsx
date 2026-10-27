import React from "react";
import { Link } from "react-router-dom";
import { Github, Twitter, MessageSquare } from "lucide-react";
import { OctoPairLogo } from "../brand/OctoPairLogo";

/**
 * Feature F27: Footer & Giant Clipped <OctoPair />
 * 
 * - Real external social links: GitHub (github.com), X (x.com), Discord (discord.com)
 * - Real legal internal links: /privacy and /terms
 * - Giant monospace code line <OctoPair /> clipped 20% at the bottom (translate-y-[20%] & overflow-hidden)
 * - Two drifting collaborative cursors: "Alex" (driftOne) and "Elena" (driftTwo)
 */
const LandingFooter = () => {
  return (
    <footer className="relative w-full bg-[#09090b] border-t border-white/10 pt-16 overflow-hidden">
      {/* ── Main Footer Navigation ─────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
              <OctoPairLogo className="h-7 w-auto text-[#f0f0f0] hover:text-[#ccff00] group-hover:text-[#ccff00] transition-colors" />
              <span className="font-mono font-bold text-lg text-[#f0f0f0] group-hover:text-white transition-colors">
                OctoPair
              </span>
            </Link>
            <p className="text-xs text-[#a0a0a0] max-w-sm leading-relaxed">
              The high-performance multiplayer IDE for builders. Pair program with sub-50ms latency, zero local installation, and cryptographically verified proof of work.
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
          <p>Sub-50ms peer operational transform.</p>
        </div>
      </div>

      {/* ── Giant Monospace <OctoPair /> Tag Clipped 20% ──────────── */}
      <div className="relative w-full overflow-hidden flex justify-center items-end select-none pointer-events-none">
        {/* Drifting cursor 1: Alex */}
        <div 
          aria-hidden="true"
          className="absolute top-4 left-1/4 animate-drift-one flex items-center gap-1.5 z-10 opacity-80"
          style={{ animationName: "driftOne" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#ccff00">
            <path d="M3.5 2.5L19.5 12.5L11.5 14L8.5 21.5L3.5 2.5Z" />
          </svg>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#ccff00] text-black">
            Alex
          </span>
        </div>

        {/* Drifting cursor 2: Elena */}
        <div 
          aria-hidden="true"
          className="absolute top-12 right-1/4 animate-drift-two flex items-center gap-1.5 z-10 opacity-80"
          style={{ animationName: "driftTwo" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#b266ff">
            <path d="M3.5 2.5L19.5 12.5L11.5 14L8.5 21.5L3.5 2.5Z" />
          </svg>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#b266ff] text-white">
            Elena
          </span>
        </div>

        {/* Giant Monospace code line clipped 20% at the bottom */}
        <div className="font-mono font-black text-6xl sm:text-8xl md:text-9xl lg:text-[14rem] tracking-tighter text-white/[0.04] translate-y-[20%] whitespace-nowrap leading-none pb-2">
          &lt;OctoPair /&gt;
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
