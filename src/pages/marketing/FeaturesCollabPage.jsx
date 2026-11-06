import React from "react";
import { Link } from "react-router-dom";
import { Terminal, ArrowRight, ArrowLeft, Check } from "lucide-react";

import RoomFeaturesSection from "../../components/landing/RoomFeaturesSection";
import FeatureBentoGrid from "../../components/landing/FeatureBentoGrid";
import WatchSessionSection from "../../components/landing/WatchSessionSection";
import FinalCtaSection from "../../components/landing/FinalCtaSection";

/**
 * Simulated Multiplayer Studio
 * Embedded directly in the hero viewport of /features/collab.
 * Features:
 * - Skiper dynamic island top bar (file capsule, active peers, latency)
 * - Live audio mesh waveform indicator
 * - Syntax highlighted Rust code editor with live cursor badges (Alex & Elena)
 * - Synced live terminal preview
 */
const HeroMultiplayerStudio = () => {
  return (
    <div className="w-full max-w-xl mx-auto rounded-2xl bg-[#111113] border border-white/10 shadow-2xl overflow-hidden font-mono text-xs flex flex-col relative transition-all duration-300 hover:border-white/20">
      {/* ── Skiper Dynamic Island Top Bar ────────────────────────────── */}
      <div className="h-11 bg-[#0d0d0f] border-b border-white/[0.08] px-3.5 flex items-center justify-between">
        {/* macOS Traffic Dots */}
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
        </div>

        {/* Dynamic Island Capsule */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/70 border border-white/10 shadow-inner">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ccff00] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ccff00]" />
          </span>
          <span className="text-[11px] font-bold text-[#f0f0f0]">mesh_transport.rs</span>
          <span className="text-[10px] text-zinc-500">•</span>
          <span className="text-[10px] text-[#ccff00] font-semibold">18ms mesh</span>
        </div>

        {/* Audio Mesh Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#b266ff]/10 border border-[#b266ff]/25 text-[#b266ff] text-[10px]">
          <div className="flex items-end gap-0.5 h-3">
            <span className="w-0.5 bg-[#b266ff] animate-[waveform_1s_ease-in-out_infinite] h-2" />
            <span className="w-0.5 bg-[#b266ff] animate-[waveform_1s_ease-in-out_infinite_0.2s] h-3" />
            <span className="w-0.5 bg-[#b266ff] animate-[waveform_1s_ease-in-out_infinite_0.4s] h-1.5" />
          </div>
          <span className="font-bold">Voice Live</span>
        </div>
      </div>

      {/* ── Live Code Editor Pane ────────────────────────────────────── */}
      <div className="p-4 bg-[#111113] overflow-hidden text-xs leading-6 space-y-1">
        {/* Line 1 */}
        <div className="flex items-center h-6">
          <span className="w-6 text-right pr-3 text-zinc-600 select-none">1</span>
          <div className="flex-1 whitespace-pre truncate">
            <span className="text-[#b266ff] font-semibold">pub async fn</span>{" "}
            <span className="text-[#60a5fa]">broadcast_delta</span>
            <span className="text-zinc-400">(peer: &amp;Peer, delta: &amp;[u8]) -&gt; Result&lt;()&gt; &#123;</span>
          </div>
        </div>

        {/* Line 2 */}
        <div className="flex items-center h-6">
          <span className="w-6 text-right pr-3 text-zinc-600 select-none">2</span>
          <div className="flex-1 whitespace-pre truncate">
            <span className="text-zinc-400">    let channel = peer.</span>
            <span className="text-[#60a5fa]">open_datachannel</span>
            <span className="text-zinc-400">(</span>
            <span className="text-[#ccff00]">"octo-sync"</span>
            <span className="text-zinc-400">).await?;</span>
          </div>
        </div>

        {/* Line 3 (Alex active typing line with live badge) */}
        <div className="flex items-center h-6 bg-[#ccff00]/[0.04] border-l-2 border-[#ccff00]">
          <span className="w-6 text-right pr-3 text-zinc-600 select-none">3</span>
          <div className="flex-1 whitespace-pre truncate">
            <span className="text-zinc-400">    channel.</span>
            <span className="text-[#60a5fa]">send_packet</span>
            <span className="text-zinc-400">(delta).await?;</span>
            {/* Alex Cursor Badge */}
            <span className="relative inline-flex items-center ml-1 select-none pointer-events-none align-middle">
              <span className="w-[2px] h-4 bg-[#ccff00] animate-pulse rounded-full inline-block" />
              <span className="absolute -top-5 left-0 px-1.5 py-0.5 rounded bg-[#ccff00] text-black text-[9px] font-mono font-bold leading-none shadow-md flex items-center gap-1">
                <svg width="6" height="6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.5 2.5L19.5 12.5L11.5 14L8.5 21.5L3.5 2.5Z" />
                </svg>
                <span>Alex</span>
              </span>
            </span>
          </div>
        </div>

        {/* Line 4 */}
        <div className="flex items-center h-6">
          <span className="w-6 text-right pr-3 text-zinc-600 select-none">4</span>
          <div className="flex-1 whitespace-pre truncate">
            <span className="text-[#52525b] italic">    // [WebRTC direct mesh: 18ms roundtrip sync]</span>
          </div>
        </div>

        {/* Line 5 (Elena active review line with live badge) */}
        <div className="flex items-center h-6 bg-[#b266ff]/[0.04] border-l-2 border-[#b266ff]">
          <span className="w-6 text-right pr-3 text-zinc-600 select-none">5</span>
          <div className="flex-1 whitespace-pre truncate">
            <span className="text-zinc-400">    </span>
            <span className="text-[#b266ff] font-semibold">Ok</span>
            <span className="text-zinc-400">(())</span>
            {/* Elena Cursor Badge */}
            <span className="relative inline-flex items-center ml-1 select-none pointer-events-none align-middle">
              <span className="w-[2px] h-4 bg-[#b266ff] animate-pulse rounded-full inline-block" />
              <span className="absolute -top-5 left-0 px-1.5 py-0.5 rounded bg-[#b266ff] text-white text-[9px] font-mono font-bold leading-none shadow-md flex items-center gap-1">
                <svg width="6" height="6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.5 2.5L19.5 12.5L11.5 14L8.5 21.5L3.5 2.5Z" />
                </svg>
                <span>Elena</span>
              </span>
            </span>
          </div>
        </div>

        {/* Line 6 */}
        <div className="flex items-center h-6">
          <span className="w-6 text-right pr-3 text-zinc-600 select-none">6</span>
          <div className="flex-1 whitespace-pre truncate">
            <span className="text-zinc-400">&#125;</span>
          </div>
        </div>
      </div>

      {/* ── Synced Live Terminal Preview ─────────────────────────────── */}
      <div className="bg-[#09090b] border-t border-white/[0.08] p-3 text-[11px]">
        <div className="flex items-center justify-between text-zinc-500 text-[10px] uppercase mb-1.5 pb-1 border-b border-white/[0.04]">
          <div className="flex items-center gap-1.5 text-zinc-300">
            <Terminal className="w-3 h-3 text-[#ccff00]" />
            <span className="font-bold">SYNCED TERMINAL • zsh</span>
          </div>
          <span className="text-[#ccff00] font-semibold">● P2P ACTIVE (18ms)</span>
        </div>
        <div className="space-y-0.5 text-zinc-400">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Check className="w-3 h-3 stroke-[3]" />
            <span>WebRTC DataChannel established: 2 peers connected</span>
          </div>
          <div className="text-zinc-400">$ cargo test --lib -- --nocapture</div>
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <Check className="w-3 h-3 stroke-[3]" />
            <span>test mesh::tests::test_p2p_sync ... ok (4ms)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * FeaturesCollabPage (/features/collab)
 *
 * Dedicated marketing sub-page for Sub-50ms Live Collaboration & Real-Time Multiplayer IDE.
 * Senior UI/UX Overhaul:
 * - 2-Column Split Hero with Simulated Multiplayer Studio (Skiper dynamic island, live badges, audio mesh)
 * - Primary semantic h1 title
 * - RoomFeaturesSection: Scripted browser mockup & 12 platform capabilities
 * - FeatureBentoGrid: 5-card bento grid (WebRTC engine, cloud terminal, canvas, proof of work)
 * - WatchSessionSection: Looping interactive session tiles with multiplayer cursor tracking
 * - Inter-feature CTA link to /features/feed
 * - Closing signup CTA banner routing to /login?mode=signup
 */
const FeaturesCollabPage = () => {
  return (
    <div className="w-full bg-[#09090b] text-[#f0f0f0] overflow-x-clip">
      {/* ── Split Visual Hero ───────────────────────────────────────── */}
      <section className="relative w-full pt-16 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Ambient Top Glow */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] max-w-full h-[320px] bg-[#ccff00]/[0.07] blur-[140px] pointer-events-none rounded-full"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          {/* Left Column: Headlines & CTAs */}
          <div className="lg:col-span-5 flex flex-col items-start text-left">
            {/* Breadcrumb / Back Link */}
            <div className="mb-6">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-xs font-mono text-[#a0a0a0] hover:text-[#f0f0f0] transition-colors px-3 py-1.5 rounded-full bg-white/5 border border-white/10"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Overview</span>
              </Link>
            </div>

            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/25 text-xs font-mono text-[#ccff00] uppercase tracking-wider mb-6">
              <Terminal className="w-3.5 h-3.5" />
              <span>REAL-TIME MULTIPLAYER IDE</span>
            </div>

            {/* Semantic Title: Exactly one h1 */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#f0f0f0] mb-6 leading-[1.1]">
              Sub-50ms Live Collaboration
            </h1>

            {/* Descriptive Subtitle */}
            <p className="text-base sm:text-lg text-[#a0a0a0] max-w-xl leading-relaxed mb-8 font-normal">
              Experience zero-latency peer programming with instant real-time code synchronization, shared cloud terminals, and synchronized previews.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-8">
              <Link
                to="/login?mode=signup"
                className="w-full sm:w-auto bg-[#ccff00] hover:bg-[#d9ff33] text-black font-bold font-mono text-sm px-6 py-3.5 rounded-xl transition-all duration-200 inline-flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(204,255,0,0.25)]"
              >
                <span>Start Pairing Free</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/features/feed"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-[#f0f0f0] transition-colors inline-flex items-center justify-center gap-2"
              >
                <span>Explore Developer Feed</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Technical Proof Points */}
            <div className="flex items-center gap-6 text-xs font-mono text-[#52525b]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00]" />
                <span>WebRTC DataMesh</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#b266ff]" />
                <span>Shared Cloud PTY</span>
              </div>
            </div>
          </div>

          {/* Right Column: Simulated Multiplayer Studio */}
          <div className="lg:col-span-7 w-full flex justify-center">
            <HeroMultiplayerStudio />
          </div>
        </div>
      </section>

      {/* ── Assembled Landing Sections ─────────────────────────────── */}
      <RoomFeaturesSection />
      <FeatureBentoGrid />
      <WatchSessionSection />

      {/* ── Inter-Feature Navigation CTA ───────────────────────────── */}
      <section className="relative w-full py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="p-6 sm:p-8 rounded-2xl bg-[#111113] border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <span className="text-[11px] font-mono text-[#a0a0a0] uppercase tracking-wider block mb-1">
              Next Capability
            </span>
            <h3 className="text-xl font-bold text-[#f0f0f0]">
              Interactive Code Feed &amp; Debug SOS
            </h3>
            <p className="text-xs text-[#a0a0a0] mt-1">
              Sandboxed in-browser code execution, community discussions, and urgent debug radar broadcasts.
            </p>
          </div>
          <Link
            to="/features/feed"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-mono font-semibold text-[#f0f0f0] border border-white/15 transition-all group shrink-0"
          >
            <span>Explore Developer Feed</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* ── Closing Banner CTA ─────────────────────────────────────── */}
      <FinalCtaSection />
    </div>
  );
};

export default FeaturesCollabPage;
