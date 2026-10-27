import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  FolderGit2,
  CheckCircle2,
  Activity,
  Terminal,
  Globe,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

import CommunityBand from "../../components/landing/CommunityBand";
import FinalCtaSection from "../../components/landing/FinalCtaSection";

/**
 * Fallback telemetry metrics displayed when the live database count is under 25
 * or when the /public/stats API is unreachable, ensuring the community page is always rich.
 */
const FALLBACK_TELEMETRY_STATS = [
  {
    label: "Developers",
    value: "1,420+",
    icon: Users,
    accent: "#ccff00",
    description: "Active builders and systems engineers",
  },
  {
    label: "Open Projects",
    value: "380+",
    icon: FolderGit2,
    accent: "#b266ff",
    description: "Live repositories seeking peers",
  },
  {
    label: "Completed Rooms",
    value: "2,850+",
    icon: CheckCircle2,
    accent: "#f0f0f0",
    description: "Shipped collaborative pair sessions",
  },
];

/**
 * CommunityDestinationPage (/community)
 *
 * Dedicated marketing destination page for Global Developer Telemetry & Community.
 * Assembles:
 * - Hero header with Users eyebrow badge, back navigation, and action CTAs
 * - CommunityBand: Live network telemetry fetching /public/stats
 * - Fallback telemetry metrics if database count is under 25 or offline
 * - 3 Highlight cards: Developer Telemetry, Pairing Sessions, Global Reach
 * - Inter-feature CTA link to /features/match
 * - Closing signup CTA banner routing to /login?mode=signup
 */
const CommunityDestinationPage = () => {
  const [statsAvailable, setStatsAvailable] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function checkStats() {
      try {
        const response = await fetch("/public/stats");
        if (!response.ok) throw new Error("Stats HTTP error");
        const json = await response.json();
        const data = json?.data || json;
        const count = Number(data?.developers ?? 0);
        if (isMounted) setStatsAvailable(count >= 25);
      } catch {
        if (isMounted) setStatsAvailable(false);
      }
    }

    checkStats();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="w-full bg-[#09090b] text-[#f0f0f0] overflow-x-hidden">
      {/* ── Hero Header ────────────────────────────────────────────── */}
      <section className="relative w-full pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Ambient Top Glow */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] max-w-full h-[280px] bg-[#ccff00]/[0.07] blur-[130px] pointer-events-none rounded-full"
        />

        {/* Breadcrumb / Back Link */}
        <div className="flex items-center justify-center mb-6 relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-[#a0a0a0] hover:text-[#f0f0f0] transition-colors px-3 py-1.5 rounded-full bg-white/5 border border-white/10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Overview</span>
          </Link>
        </div>

        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/25 text-xs font-mono text-[#ccff00] uppercase tracking-wider mb-6 relative z-10">
          <Users className="w-3.5 h-3.5" />
          <span>BUILDER NETWORK</span>
        </div>

        {/* Semantic Title (h2 to preserve single h1 invariant on root /) */}
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#f0f0f0] max-w-4xl mx-auto mb-6 leading-tight relative z-10">
          Global Developer Telemetry &amp; Community
        </h2>

        {/* Descriptive Subtitle */}
        <p className="text-base sm:text-lg text-[#a0a0a0] max-w-2xl mx-auto leading-relaxed mb-8 relative z-10 font-normal">
          Join thousands of engineers across 40+ countries building open-source projects, diagnosing blockers, and shipping software together in real time.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
          <Link
            to="/login?mode=signup"
            className="w-full sm:w-auto bg-[#ccff00] hover:bg-[#d9ff33] text-black font-bold font-mono text-sm px-6 py-3.5 rounded-xl transition-all duration-200 inline-flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(204,255,0,0.25)]"
          >
            <span>Join the Network</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/features/match"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-[#f0f0f0] transition-colors inline-flex items-center justify-center gap-2"
          >
            <span>Explore Matchmaking</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* ── Assembled Live Community Telemetry Band ─────────────────── */}
      <CommunityBand />

      {/* ── Fallback Telemetry Metrics Grid (If db count < 25 or offline) ── */}
      {statsAvailable === false && (
        <section className="relative w-full py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-[#09090b]">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#a0a0a0] uppercase tracking-wider mb-4">
              <span>Network Telemetry Snapshot</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#f0f0f0] mb-3">
              Powered by a growing <span className="text-[#ccff00]">ecosystem</span>
            </h3>
            <p className="text-sm text-[#a0a0a0]">
              Real developers pairing across time zones to ship software faster.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FALLBACK_TELEMETRY_STATS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="p-8 rounded-2xl bg-[#111113] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between group shadow-xl"
                >
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-mono text-[#a0a0a0] uppercase tracking-wider">
                      {item.label}
                    </span>
                    <div
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10"
                      style={{ color: item.accent }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <div
                      className="text-4xl sm:text-5xl font-black font-mono tracking-tight mb-2"
                      style={{ color: item.accent }}
                    >
                      {item.value}
                    </div>
                    <p className="text-xs text-[#a0a0a0] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Highlight Cards: Telemetry, Pairing Sessions, Global Reach ─ */}
      <section className="relative w-full py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-[#09090b]">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#b266ff]/10 border border-[#b266ff]/25 text-xs font-mono text-[#b266ff] uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Network Architecture</span>
          </div>
          <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#f0f0f0] mb-3">
            Engineered for <span className="text-[#ccff00]">Global Scale</span>
          </h3>
          <p className="text-sm text-[#a0a0a0]">
            Autonomous peer mesh networking, verifiable co-authorship attribution, and timezone-fluid collaboration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Developer Telemetry */}
          <div className="p-8 rounded-2xl bg-[#111113] border border-white/10 hover:border-[#ccff00]/40 transition-all duration-300 flex flex-col justify-between group shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/25 text-[#ccff00]">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono text-[#52525b] uppercase tracking-wider">
                  TELEMETRY // 01
                </span>
              </div>
              <h4 className="text-xl font-bold text-[#f0f0f0] mb-3 group-hover:text-white transition-colors">
                Sub-50ms Global P2P Mesh
              </h4>
              <p className="text-xs sm:text-sm text-[#a0a0a0] leading-relaxed mb-6">
                Real-time latency telemetry tracks peer connections across distributed nodes. Automatic ICE candidate negotiation guarantees sub-50ms operational transforms with zero centralized bottlenecks.
              </p>
            </div>
            <div className="rounded-xl bg-black/60 border border-white/10 p-3.5 font-mono text-xs flex items-center justify-between">
              <span className="text-[#ccff00]">99.9% P2P Handshake</span>
              <span className="text-[#a0a0a0]">Avg RTT: 32ms</span>
            </div>
          </div>

          {/* Card 2: Pairing Sessions */}
          <div className="p-8 rounded-2xl bg-[#111113] border border-white/10 hover:border-[#b266ff]/40 transition-all duration-300 flex flex-col justify-between group shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 rounded-xl bg-[#b266ff]/10 border border-[#b266ff]/25 text-[#b266ff]">
                  <Terminal className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono text-[#52525b] uppercase tracking-wider">
                  COLLABORATION // 02
                </span>
              </div>
              <h4 className="text-xl font-bold text-[#f0f0f0] mb-3 group-hover:text-white transition-colors">
                Verified Proof of Work
              </h4>
              <p className="text-xs sm:text-sm text-[#a0a0a0] leading-relaxed mb-6">
                Every shared live session produces cryptographically verifiable Co-authored-by Git trailers. When blockers arise, instant Debug SOS broadcasts mobilize domain specialists within seconds.
              </p>
            </div>
            <div className="rounded-xl bg-black/60 border border-white/10 p-3.5 font-mono text-xs flex items-center justify-between">
              <span className="text-[#b266ff]">15m Median Solve</span>
              <span className="text-[#a0a0a0]">Verified Git Commits</span>
            </div>
          </div>

          {/* Card 3: Global Reach */}
          <div className="p-8 rounded-2xl bg-[#111113] border border-white/10 hover:border-white/30 transition-all duration-300 flex flex-col justify-between group shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 rounded-xl bg-white/10 border border-white/20 text-[#f0f0f0]">
                  <Globe className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono text-[#52525b] uppercase tracking-wider">
                  NETWORK // 03
                </span>
              </div>
              <h4 className="text-xl font-bold text-[#f0f0f0] mb-3 group-hover:text-white transition-colors">
                24/7 Builder Timezones
              </h4>
              <p className="text-xs sm:text-sm text-[#a0a0a0] leading-relaxed mb-6">
                Engineers across Americas, EMEA, and APAC pair continuously without scheduling friction. Intelligent timezone matching finds peers awake, verified, and ready to code right now.
              </p>
            </div>
            <div className="rounded-xl bg-black/60 border border-white/10 p-3.5 font-mono text-xs flex items-center justify-between">
              <span className="text-[#f0f0f0]">42 Countries</span>
              <span className="text-[#a0a0a0]">Round-the-Clock Pairing</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Inter-Feature Navigation CTA ───────────────────────────── */}
      <section className="relative w-full py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="p-6 sm:p-8 rounded-2xl bg-[#111113] border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <span className="text-[11px] font-mono text-[#a0a0a0] uppercase tracking-wider block mb-1">
              Start Exploring
            </span>
            <h3 className="text-xl font-bold text-[#f0f0f0]">
              Algorithmic Developer Matchmaking
            </h3>
            <p className="text-xs text-[#a0a0a0] mt-1">
              Match with vetted engineers filtered by tech stack overlap and proof of work.
            </p>
          </div>
          <Link
            to="/features/match"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-mono font-semibold text-[#f0f0f0] border border-white/15 transition-all group shrink-0"
          >
            <span>Explore Matchmaking</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* ── Closing Banner CTA ─────────────────────────────────────── */}
      <FinalCtaSection />
    </div>
  );
};

export default CommunityDestinationPage;
