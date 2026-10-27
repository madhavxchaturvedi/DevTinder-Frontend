import React from "react";
import { Link } from "react-router-dom";
import {
  Video,
  Mic,
  PhoneOff,
  CheckSquare,
  MessageSquare,
  Maximize2,
  Download,
  Smile,
  Code2,
  ArrowRight,
  CheckCircle2,
  GitFork,
  Command,
  Bell,
  Users,
  Bookmark
} from "lucide-react";

const RoomFeaturesSection = () => {
  const roomSurroundFeatures = [
    {
      icon: Video,
      color: "#ccff00",
      title: "Live Video & Voice",
      subtitle: "Integrated WebRTC audio and video mesh right beside your shared editor",
    },
    {
      icon: CheckSquare,
      color: "#ccff00",
      title: "Shared Task List",
      subtitle: "Live synchronized checklist to keep pair-programming milestones in sync",
    },
    {
      icon: MessageSquare,
      color: "#b266ff",
      title: "Team Chat",
      subtitle: "Persistent room discussion with inline code snippet references",
    },
    {
      icon: Smile,
      color: "#ccff00",
      title: "Reaction Emotes",
      subtitle: "Express live feedback and celebrate merges without breaking flow",
    },
    {
      icon: Maximize2,
      color: "#f0f0f0",
      title: "Full-Screen Preview",
      subtitle: "Full-fidelity responsive output preview with live hot-reloading",
    },
    {
      icon: Download,
      color: "#f0f0f0",
      title: "ZIP Export",
      subtitle: "Download your entire synchronized room project tree at any time",
    },
    {
      icon: CheckCircle2,
      color: "#ccff00",
      title: "Resolved SOS Answers",
      subtitle: "Verify solutions in live debug sessions to build your track record",
    },
    {
      icon: GitFork,
      color: "#b266ff",
      title: "Codebase Forking",
      subtitle: "Fork any shared snippet or repository directly into your room",
    },
    {
      icon: Command,
      color: "#f0f0f0",
      title: "Cmd+K Quick Actions",
      subtitle: "Fuzzy search across active rooms, projects, users, and files",
    },
    {
      icon: Bell,
      color: "#b266ff",
      title: "Live Notifications",
      subtitle: "Instant room invites, join request alerts, and mention badges",
    },
    {
      icon: Users,
      color: "#ccff00",
      title: "Who's Online Presence",
      subtitle: "Real-time collaborator presence indicators across workspaces",
    },
    {
      icon: Bookmark,
      color: "#f0f0f0",
      title: "Saved Room History",
      subtitle: "Revisit past pair programming rooms, tasks, and shared workspaces",
    },
  ];

  return (
    <section id="room-features" className="relative w-full py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-[#09090b]">
      {/* ── Section Header ─────────────────────────────────────────── */}
      <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#b266ff]/10 border border-[#b266ff]/25 text-xs font-mono text-[#b266ff] uppercase tracking-wider mb-4">
          <Code2 className="w-3.5 h-3.5" />
          <span>FULL ROOM EXPERIENCE</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#f0f0f0] mb-4">
          Everything you need to <span className="text-[#ccff00]">ship, live</span>
        </h2>
        <p className="text-sm sm:text-base text-[#a0a0a0]">
          Code, preview, video call, synchronized tasks, and shared chat all inside one low-latency screen.
        </p>
      </div>

      {/* ── Large Browser Chrome Mockup ────────────────────────────── */}
      <div className="rounded-2xl bg-[#111113] border border-white/10 overflow-hidden shadow-2xl mb-14">
        {/* Top Browser Bar */}
        <div className="bg-[#0a0a0c] border-b border-white/[0.06] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
          </div>
          <div className="px-4 py-1 rounded-md bg-black/50 border border-white/5 text-[11px] font-mono text-[#a0a0a0] max-w-xs truncate">
            octopair.dev/room/rust-mesh-v1
          </div>
          <div className="w-10" />
        </div>

        {/* 4-Panel Grid: Code Editor, Scripted Live Preview, Task List, Team Chat */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-b border-white/[0.06] bg-[#09090b]">
          {/* Panel 1: Code Editor (Pure scripted CSS mock) */}
          <div className="col-span-1 p-4 border-r border-b md:border-b-0 border-white/[0.06] min-h-[160px] flex flex-col justify-between font-mono text-xs">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[#52525b] mb-2 pb-1 border-b border-white/[0.04] flex items-center justify-between">
                <span>Editor</span>
                <span className="text-[#ccff00]">main.rs</span>
              </div>
              <div className="space-y-1 text-[11px] leading-relaxed">
                <div>
                  <span className="text-[#b266ff]">const</span> peer ={" "}
                  <span className="text-[#ccff00]">room</span>.connect(&#123;
                </div>
                <div className="pl-3 text-[#a0a0a0]">channel: "mesh-v1",</div>
                <div className="pl-3 text-[#a0a0a0]">p2p: true,</div>
                <div>
                  &#125;);
                  <span className="inline-block w-1.5 h-3 bg-[#ccff00] ml-0.5 animate-pulse motion-reduce:animate-none align-middle" />
                </div>
              </div>
            </div>
            <div className="text-[10px] text-[#52525b] mt-2">UTF-8 · Rust</div>
          </div>

          {/* Panel 2: Live Preview (Pure scripted CSS mock - ZERO Sandpack) */}
          <div className="col-span-1 p-4 border-r border-b md:border-b-0 border-white/[0.06] min-h-[160px] bg-[#0f0f12] flex flex-col justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[#52525b] mb-2 pb-1 border-b border-white/[0.04] flex items-center justify-between">
                <span>Live Preview</span>
                <span className="text-[#a0a0a0]">3000</span>
              </div>
              <div className="p-2.5 rounded-lg bg-black/60 border border-[#ccff00]/30 text-center my-2">
                <div className="w-3 h-3 rounded-full bg-[#ccff00] mx-auto mb-1 animate-pulse motion-reduce:animate-none" />
                <div className="text-[11px] font-bold text-white">AudioViz v0.3</div>
                <div className="text-[9px] font-mono text-[#ccff00]">60 FPS Canvas</div>
              </div>
            </div>
            <div className="text-[10px] font-mono text-[#52525b]">localhost:3000</div>
          </div>

          {/* Panel 3: Shared Task List */}
          <div className="col-span-1 p-4 border-r border-b md:border-b-0 border-white/[0.06] min-h-[160px] flex flex-col justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[#52525b] mb-2 pb-1 border-b border-white/[0.04] flex items-center justify-between">
                <span>Tasks</span>
                <span className="text-[#b266ff]">2/3 Done</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="text-[#52525b] line-through flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-[#ccff00]" />
                  <span>Initialize socket mesh</span>
                </div>
                <div className="text-[#52525b] line-through flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-[#ccff00]" />
                  <span>Buffer allocation</span>
                </div>
                <div className="text-white font-medium flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded border border-white/40" />
                  WebRTC DataChannel
                </div>
              </div>
            </div>
            <div className="text-[10px] font-mono text-[#52525b]">Synced (WebSockets)</div>
          </div>

          {/* Panel 4: Team Chat */}
          <div className="col-span-1 p-4 min-h-[160px] flex flex-col justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[#52525b] mb-2 pb-1 border-b border-white/[0.04] flex items-center justify-between">
                <span>Room Chat</span>
                <span className="text-[#ccff00]">Active</span>
              </div>
              <div className="space-y-2 text-[11px]">
                <div className="p-2 rounded bg-white/5 border border-white/5 text-[#a0a0a0]">
                  <span className="text-[#b266ff] font-semibold block text-[10px]">Elena</span>
                  just pushed the mesh patch
                </div>
                <div className="p-2 rounded bg-[#b266ff]/15 border border-[#b266ff]/25 text-[#f0f0f0] font-mono text-[10px]">
                  <span className="text-[#ccff00] font-semibold block text-[10px]">Alex</span>
                  peer.emit("sync")
                </div>
              </div>
            </div>
            <div className="text-[10px] font-mono text-[#52525b]">2 online</div>
          </div>
        </div>

        {/* Video Call Bar Strip */}
        <div className="bg-[#080809] border-t border-white/[0.06] p-3 sm:p-4 flex flex-wrap items-center justify-between gap-4">
          {/* Avatar Video Tiles */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1a1a1a] border border-white/20 flex items-center justify-center text-xs font-bold font-mono text-[#b266ff] ring-2 ring-[#ccff00] animate-pulse motion-reduce:animate-none">
                ER
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#ccff00] border-2 border-black" />
            </div>

            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1a1a1a] border border-white/20 flex items-center justify-center text-xs font-bold font-mono text-[#f0f0f0]">
                AR
              </div>
            </div>

            <div className="ml-1">
              <div className="text-xs font-mono font-semibold text-[#ccff00]">Elena · Speaking</div>
              <div className="text-[11px] font-mono text-[#52525b]">WebRTC Audio 64kbps</div>
            </div>
          </div>

          {/* Inactive Call Controls */}
          <div className="flex items-center gap-2">
            <div className="p-2 sm:p-2.5 rounded-lg bg-white/10 text-white cursor-default" title="Microphone Active">
              <Mic className="w-4 h-4" />
            </div>
            <div className="p-2 sm:p-2.5 rounded-lg bg-white/10 text-white cursor-default" title="Camera Active">
              <Video className="w-4 h-4" />
            </div>
            <div className="p-2 sm:p-2.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 cursor-default" title="Leave Room">
              <PhoneOff className="w-4 h-4" />
            </div>
          </div>

          {/* Reaction Bubbles */}
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#f0f0f0]">
              <Smile className="w-3.5 h-3.5 text-[#ccff00]" />
              <span>+3</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Everything Around The Room: Compact 8-Tile Band ───────── */}
      <div className="mb-14">
        <div className="text-center mb-8">
          <p className="text-xs font-mono text-[#52525b] uppercase tracking-widest">
            PLATFORM CAPABILITIES
          </p>
          <h3 className="text-xl sm:text-2xl font-bold text-[#f0f0f0] mt-1">
            Everything built around the room
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {roomSurroundFeatures.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="p-5 rounded-xl bg-[#111113] border border-white/10 hover:-translate-y-2 transition-transform duration-300 group shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-105"
                    style={{ backgroundColor: `${f.color}15`, border: `1px solid ${f.color}30` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: f.color }} />
                  </div>
                  <h4 className="text-sm font-bold text-[#f0f0f0] mb-1 group-hover:text-white transition-colors">
                    {f.title}
                  </h4>
                  <p className="text-xs text-[#a0a0a0] leading-relaxed">{f.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Section Bottom CTA ─────────────────────────────────────── */}
      <div className="text-center">
        <h3 className="text-xl sm:text-2xl font-bold text-[#f0f0f0] mb-4">Ready to pair live?</h3>
        <Link
          to="/login?mode=signup"
          className="bg-[#ccff00] hover:bg-[#d9ff33] text-black font-bold text-sm sm:text-base px-8 py-3.5 rounded-xl shadow-[0_0_20px_rgba(204,255,0,0.25)] hover:shadow-[0_0_30px_rgba(204,255,0,0.4)] transition-all duration-200 inline-flex items-center gap-2 active:scale-[0.98]"
        >
          <span>Open Your First Room</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};

export default RoomFeaturesSection;
