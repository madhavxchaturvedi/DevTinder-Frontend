import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Code2, Sparkles } from "lucide-react";

/**
 * Feature F25: Final Call To Action Section
 * 
 * - Headline containing "Ready to stop coding in isolation" or "stop coding alone"
 * - High-impact CTA button routing to /login?mode=signup
 */
const FinalCtaSection = () => {
  return (
    <section className="relative w-full py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-[#09090b]">
      {/* ── Ambient Background Glows ───────────────────────────────── */}
      <div 
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] max-w-full h-[350px] bg-[#ccff00]/[0.07] blur-[150px] pointer-events-none rounded-full" 
      />

      {/* ── High-Impact Banner Card ─────────────────────────────────── */}
      <div className="relative rounded-3xl bg-[#111113] border border-white/10 p-8 sm:p-16 text-center max-w-5xl mx-auto overflow-hidden shadow-2xl">
        <div 
          aria-hidden="true"
          className="absolute -top-24 right-10 w-96 h-96 bg-[#b266ff]/10 blur-[100px] pointer-events-none rounded-full" 
        />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/25 text-[#ccff00] text-xs font-mono font-semibold uppercase tracking-wider mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Multiplayer Collaboration</span>
        </div>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#f0f0f0] max-w-3xl mx-auto mb-6 leading-tight">
          Ready to stop coding in isolation?
        </h2>

        <p className="text-base sm:text-lg text-[#a0a0a0] max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Join engineers around the world building live in real-time. Pick an active repository, connect with a peer, and ship together.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/login?mode=signup"
            className="w-full sm:w-auto bg-[#ccff00] hover:bg-[#d9ff33] text-black font-bold font-mono text-sm sm:text-base px-8 py-4 rounded-xl shadow-[0_0_25px_rgba(204,255,0,0.3)] hover:shadow-[0_0_35px_rgba(204,255,0,0.5)] transition-all duration-200 inline-flex items-center justify-center gap-2 group active:scale-[0.98]"
          >
            <span>Start Pairing Now</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 text-xs font-mono text-[#52525b]">
          <span>Zero Local Setup Required</span>
          <span>•</span>
          <span>In-Browser WebRTC IDE</span>
          <span>•</span>
          <span>Verified Co-Authorship</span>
        </div>
      </div>
    </section>
  );
};

export default FinalCtaSection;
