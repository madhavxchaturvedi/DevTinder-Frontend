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
  Radio,
  Calendar,
  Clock,
  MessageSquare,
  Mic,
} from "lucide-react";

import CommunityBand from "../../components/landing/CommunityBand";
import FinalCtaSection from "../../components/landing/FinalCtaSection";

/**
 * AnimatedCounter: Pure React counter component for telemetry metrics.
 * - In SSR / prerender / Node test contexts, renders target value immediately.
 * - On client mount, resets to 0 and animates up to value using requestAnimationFrame.
 * - Automatically respects prefers-reduced-motion media query.
 */
const AnimatedCounter = ({ value, duration = 1400, suffix = "" }) => {
  const [count, setCount] = useState(value);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (prefersReducedMotion) return;

    setCount(0);
    let startTime = null;
    let frameId;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quart: 1 - Math.pow(1 - progress, 4)
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeProgress * value));

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        setCount(value);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [value, duration]);

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

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
 * Weekly hack sprint schedule data.
 */
const WEEKLY_HACK_SPRINTS = [
  {
    id: "sprint-1",
    day: "TUE",
    time: "18:00 UTC",
    accent: "#ccff00",
    title: "Distributed Systems & Rust Jam",
    description: "WebRTC peer-to-peer data mesh transport & zero-copy ring buffers",
    host: "Elena Rostova",
    role: "Systems Engineer",
    tags: ["Rust", "WebRTC", "Tokio"],
    rsvpStatus: "RSVP Open",
    builderCount: "16 builders registered",
  },
  {
    id: "sprint-2",
    day: "THU",
    time: "19:00 UTC",
    accent: "#b266ff",
    title: "AI Inference & Tree-sitter Hack",
    description: "In-browser AST indexing and local web-LLM collaborative pair assistant",
    host: "Marcus Vance",
    role: "Compiler Architect",
    tags: ["TypeScript", "Tree-sitter", "WASM"],
    rsvpStatus: "RSVP Open",
    builderCount: "24 builders registered",
  },
  {
    id: "sprint-3",
    day: "SAT",
    time: "00:00 UTC",
    accent: "#38bdf8",
    title: "Global 48h Pair Sprint",
    description: "Pick an open codebase from the repository graph and ship an MVP live",
    host: "OctoPair Core Team",
    role: "Community Leads",
    tags: ["Full-Stack", "Multiplayer", "Go/Rust"],
    rsvpStatus: "Worldwide Sprint",
    builderCount: "42 teams pairing",
  },
];

/**
 * Active voice channels preview for Discord Lounge card.
 */
const ACTIVE_VOICE_CHANNELS = [
  {
    name: "rust-systems-jam",
    activeCount: 4,
    status: "Audio Active",
  },
  {
    name: "webrtc-mesh-lab",
    activeCount: 2,
    status: "Screen Share",
  },
  {
    name: "debug-sos-live",
    activeCount: 3,
    status: "Urgent Radar",
  },
];

/**
 * CommunityDestinationPage (/community)
 *
 * Dedicated marketing destination page for Global Developer Telemetry & Community.
 * Senior visual archetype: Global Developer Command Center.
 * Assembles:
 * - Command Center Hero: Eyebrow badge, live P2P mesh status beacon, primary h1 heading, CTAs
 * - Animated Telemetry Dashboard: 4 live counters (1,420+ Builders, 380+ Repos, 2,850+ Rooms, 18ms Latency)
 * - Split Command Center Grid:
 *   - Discord Developer Lounge Card (live audio pairing channels, 4,500+ builders, Discord CTA)
 *   - Weekly Hack Sprint Schedule (Tuesday Rust Jam, Thursday AI/Tree-sitter, Saturday Global 48h Sprint)
 * - CommunityBand: Live network telemetry fetching /public/stats
 * - Fallback telemetry metrics if database count is under 25 or offline
 * - 3 Highlight cards: Developer Telemetry, Pairing Sessions, Global Reach (with humanized copy)
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
      {/* ── Global Developer Command Center Hero ────────────────────── */}
      <section className="relative w-full pt-16 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Ambient Radial Glows */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] max-w-full h-[320px] bg-[#ccff00]/[0.08] blur-[140px] pointer-events-none rounded-full"
        />
        <div
          aria-hidden="true"
          className="absolute top-36 right-[10%] w-[450px] h-[300px] bg-[#b266ff]/[0.06] blur-[130px] pointer-events-none rounded-full"
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

        {/* Eyebrow Badge & Live Telemetry Beacon */}
        <div className="inline-flex flex-wrap items-center justify-center gap-3 mb-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/25 text-xs font-mono text-[#ccff00] uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" />
            <span>BUILDER NETWORK</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#f0f0f0]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ccff00] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ccff00]" />
            </span>
            <span className="text-[#a0a0a0]">P2P MESH:</span>
            <span className="text-[#ccff00] font-bold">ACTIVE // 42 COUNTRIES</span>
          </div>
        </div>

        {/* Primary Route Heading (Single h1 invariant) */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#f0f0f0] max-w-4xl mx-auto mb-6 leading-tight relative z-10">
          Global Developer Telemetry &amp; Community
        </h1>

        {/* Descriptive Subtitle */}
        <p className="text-base sm:text-lg text-[#a0a0a0] max-w-2xl mx-auto leading-relaxed mb-8 relative z-10 font-normal">
          Join thousands of engineers across 40+ countries building open-source projects, diagnosing blockers, and shipping software together in real time.
        </p>

        {/* Hero Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 mb-8">
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

        {/* ── Animated Telemetry Dashboard Counters (4 Cards) ─────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto mt-10 relative z-10 text-left">
          {/* Metric 1: Builders */}
          <div className="p-6 rounded-2xl bg-[#111113] border border-white/10 hover:border-[#ccff00]/40 transition-all duration-300 flex flex-col justify-between shadow-xl group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono text-[#71717a] uppercase tracking-wider">
                TELEMETRY // 01
              </span>
              <div className="p-2 rounded-lg bg-[#ccff00]/10 border border-[#ccff00]/25 text-[#ccff00]">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-[#ccff00] mb-1">
                <AnimatedCounter value={1420} suffix="+" />
              </div>
              <div className="text-xs font-bold text-[#f0f0f0] font-mono mb-1">
                Active Builders
              </div>
              <p className="text-[11px] text-[#a0a0a0]">
                Verified engineers across 42 countries
              </p>
            </div>
          </div>

          {/* Metric 2: Open Repositories */}
          <div className="p-6 rounded-2xl bg-[#111113] border border-white/10 hover:border-[#b266ff]/40 transition-all duration-300 flex flex-col justify-between shadow-xl group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono text-[#71717a] uppercase tracking-wider">
                TELEMETRY // 02
              </span>
              <div className="p-2 rounded-lg bg-[#b266ff]/10 border border-[#b266ff]/25 text-[#b266ff]">
                <FolderGit2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-[#b266ff] mb-1">
                <AnimatedCounter value={380} suffix="+" />
              </div>
              <div className="text-xs font-bold text-[#f0f0f0] font-mono mb-1">
                Open Repositories
              </div>
              <p className="text-[11px] text-[#a0a0a0]">
                Live codebases seeking pair architects
              </p>
            </div>
          </div>

          {/* Metric 3: Shipped Sessions */}
          <div className="p-6 rounded-2xl bg-[#111113] border border-white/10 hover:border-[#38bdf8]/40 transition-all duration-300 flex flex-col justify-between shadow-xl group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono text-[#71717a] uppercase tracking-wider">
                TELEMETRY // 03
              </span>
              <div className="p-2 rounded-lg bg-[#38bdf8]/10 border border-[#38bdf8]/25 text-[#38bdf8]">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-[#38bdf8] mb-1">
                <AnimatedCounter value={2850} suffix="+" />
              </div>
              <div className="text-xs font-bold text-[#f0f0f0] font-mono mb-1">
                Shipped Sessions
              </div>
              <p className="text-[11px] text-[#a0a0a0]">
                Collaborative rooms with verified commits
              </p>
            </div>
          </div>

          {/* Metric 4: Mesh Latency */}
          <div className="p-6 rounded-2xl bg-[#111113] border border-white/10 hover:border-[#ccff00]/40 transition-all duration-300 flex flex-col justify-between shadow-xl group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono text-[#71717a] uppercase tracking-wider">
                TELEMETRY // 04
              </span>
              <div className="p-2 rounded-lg bg-[#ccff00]/10 border border-[#ccff00]/25 text-[#ccff00]">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-[#ccff00] mb-1">
                <AnimatedCounter value={18} suffix="ms" />
              </div>
              <div className="text-xs font-bold text-[#f0f0f0] font-mono mb-1">
                Average P2P Latency
              </div>
              <p className="text-[11px] text-[#a0a0a0]">
                Direct WebRTC peer mesh round-trip
              </p>
            </div>
          </div>
        </div>

        {/* ── Split Command Center: Discord Lounge & Hack Sprints ───── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl mx-auto mt-8 relative z-10 text-left">
          {/* Left Column (lg:col-span-5): Discord Developer Lounge Card */}
          <div className="lg:col-span-5 rounded-2xl bg-[#111113] border border-[#5865F2]/30 hover:border-[#5865F2]/50 p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 shadow-xl relative overflow-hidden group">
            <div
              aria-hidden="true"
              className="absolute -top-16 -right-16 w-44 h-44 bg-[#5865F2]/10 blur-3xl pointer-events-none rounded-full"
            />
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#5865F2]/15 border border-[#5865F2]/30 text-[11px] font-mono text-[#5865F2] uppercase tracking-wider font-semibold">
                  <Mic className="w-3.5 h-3.5" />
                  <span>VOICE PAIRING LOUNGE</span>
                </div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#22c55e]">
                  <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                  <span>4,500+ members</span>
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-[#f0f0f0] mb-2 flex items-center gap-2">
                <span>Discord Developer Lounge</span>
              </h3>

              <p className="text-xs sm:text-sm text-[#a0a0a0] leading-relaxed mb-6">
                Drop into 24/7 audio pairing lounges, join weekly system architecture reviews, and mobilize instant Debug SOS squads with domain specialists.
              </p>

              {/* Active Voice Lounges Preview */}
              <div className="space-y-2 mb-6">
                <div className="text-[11px] font-mono uppercase text-[#71717a] tracking-wider mb-1">
                  Active Pairing Channels
                </div>
                {ACTIVE_VOICE_CHANNELS.map((ch) => (
                  <div
                    key={ch.name}
                    className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between font-mono text-xs"
                  >
                    <div className="flex items-center gap-2 text-[#f0f0f0]">
                      <Radio className="w-3.5 h-3.5 text-[#5865F2]" />
                      <span>#{ch.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="text-[#a0a0a0]">{ch.activeCount} pairing</span>
                      <span className="px-1.5 py-0.5 rounded bg-white/5 text-[#22c55e] text-[10px] border border-white/10">
                        {ch.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <a
              href="https://discord.gg/octopair"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white font-mono font-bold text-xs inline-flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(88,101,242,0.25)]"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Join Discord Lounge</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Right Column (lg:col-span-7): Weekly Hack Sprint Schedule */}
          <div className="lg:col-span-7 rounded-2xl bg-[#111113] border border-white/10 hover:border-white/20 p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 shadow-xl relative overflow-hidden group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#b266ff]/15 border border-[#b266ff]/30 text-[11px] font-mono text-[#b266ff] uppercase tracking-wider font-semibold">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>WEEKLY SCHEDULE</span>
                </div>
                <div className="text-xs font-mono text-[#a0a0a0] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#ccff00]" />
                  <span>Next Sprint: Tuesday 18:00 UTC</span>
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-[#f0f0f0] mb-2">
                Weekly Hack Sprint Schedule
              </h3>

              <p className="text-xs sm:text-sm text-[#a0a0a0] leading-relaxed mb-5">
                Community pairing sprints hosted by lead open-source maintainers. Jump in, share an editor, and co-author production code live.
              </p>

              {/* Sprint Items List */}
              <div className="space-y-3 mb-5">
                {WEEKLY_HACK_SPRINTS.map((sprint) => (
                  <div
                    key={sprint.id}
                    className="p-3.5 rounded-xl bg-black/40 border border-white/5 hover:border-white/10 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="px-2.5 py-1.5 rounded-lg border text-xs font-bold text-center shrink-0"
                        style={{
                          backgroundColor: `${sprint.accent}15`,
                          borderColor: `${sprint.accent}40`,
                          color: sprint.accent,
                        }}
                      >
                        <div className="text-[10px] uppercase">{sprint.day}</div>
                        <div className="text-[9px] text-[#a0a0a0]">{sprint.time}</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#f0f0f0] font-sans">
                          {sprint.title}
                        </div>
                        <div className="text-[11px] text-[#a0a0a0] font-sans mt-0.5">
                          Host: <span className="text-[#f0f0f0]">{sprint.host}</span> ({sprint.role})
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {sprint.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-[#a0a0a0]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 text-right">
                      <span className="text-[11px] font-bold text-[#ccff00]">
                        {sprint.rsvpStatus}
                      </span>
                      <span className="text-[10px] text-[#71717a]">
                        {sprint.builderCount}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.07] flex items-center justify-between text-xs font-mono">
              <span className="text-[#a0a0a0]">
                Curated open repositories ready for pairing
              </span>
              <Link
                to="/features/projects"
                className="text-[#ccff00] hover:text-[#d4ff33] inline-flex items-center gap-1 font-bold group"
              >
                <span>Browse sprint codebases</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
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
            Autonomous peer networking, verified co-authorship attribution, and timezone-fluid collaboration.
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
              <h4 className="text-xl font-bold text-[#f0f0f0] mb-3 group-hover:text-white transition-colors" data-label="Sub-50ms Global P2P Mesh">
                Global Real-Time Mesh
              </h4>
              <p className="text-xs sm:text-sm text-[#a0a0a0] leading-relaxed mb-6">
                Real-time latency telemetry tracks peer connections across distributed nodes. Instant peer-to-peer browser connection guarantees real-time code synchronization with zero centralized bottlenecks.
              </p>
            </div>
            <div className="rounded-xl bg-black/60 border border-white/10 p-3.5 font-mono text-xs flex items-center justify-between">
              <span className="text-[#ccff00]">99.9% P2P Handshake</span>
              <span className="text-[#a0a0a0]">Avg RTT: 18ms</span>
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
                Every shared live session produces verified GitHub co-author credit on every commit. When blockers arise, instant Debug SOS broadcasts mobilize domain specialists within seconds.
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
