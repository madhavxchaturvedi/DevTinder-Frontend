import React from "react";
import { Link } from "react-router-dom";
import { Pin, FolderGit2, Terminal, UserCheck, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

const DEMO_PROFILES = [
  {
    name: "Elena Rostova",
    initials: "ER",
    role: "Systems Engineer",
    badge: "Verified Builder",
    pinnedSnippet: {
      title: "webrtc_mesh.rs",
      lang: "Rust",
      description: "Zero-copy packet routing for peer data channels",
    },
    shippedTogether: {
      roomsCount: 4,
      collaborators: ["Alex R.", "Marcus C."],
    },
    sosTrackRecord: {
      solved: 18,
      topArea: "Distributed Systems",
    },
  },
  {
    name: "Alex Rivera",
    initials: "AR",
    role: "Full-Stack Developer",
    badge: "Pro Developer",
    pinnedSnippet: {
      title: "lru_cache.ts",
      lang: "TypeScript",
      description: "O(1) eviction cache with WeakMap key storage",
    },
    shippedTogether: {
      roomsCount: 7,
      collaborators: ["Elena R.", "Sarah K."],
    },
    sosTrackRecord: {
      solved: 24,
      topArea: "React / Node.js",
    },
  },
  {
    name: "Maya Patel",
    initials: "MP",
    role: "ML Systems Engineer",
    badge: "Verified Builder",
    pinnedSnippet: {
      title: "cuda_allreduce.py",
      lang: "Python",
      description: "Distributed tensor barrier sync with PyTorch NCCL",
    },
    shippedTogether: {
      roomsCount: 3,
      collaborators: ["Elena R.", "Devon T."],
    },
    sosTrackRecord: {
      solved: 14,
      topArea: "CUDA / PyTorch",
    },
  },
];

const ProfileShowcaseBand = () => {
  return (
    <section id="profiles" className="relative w-full py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-[#09090b]">
      {/* ── Section Header ─────────────────────────────────────────── */}
      <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/25 text-xs font-mono text-[#ccff00] uppercase tracking-wider mb-4">
          <UserCheck className="w-3.5 h-3.5" />
          <span>VERIFIED DEVELOPER PROFILES</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#f0f0f0] mb-4">
          Proof of work that speaks <span className="text-[#ccff00]">for itself</span>
        </h2>
        <p className="text-sm sm:text-base text-[#a0a0a0]">
          Pinned code snippets, shipped room histories, and solved debug SOS track records directly on your developer card.
        </p>
      </div>

      {/* ── 3 Profile Cards Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
        {DEMO_PROFILES.map((profile) => (
          <div
            key={profile.name}
            className="p-7 rounded-2xl bg-[#111113] border border-white/10 hover:border-white/25 hover:-translate-y-2 transition-transform duration-300 flex flex-col justify-between group shadow-xl"
          >
            <div>
              {/* Profile Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#b266ff]/20 border border-[#b266ff]/40 flex items-center justify-center font-mono font-bold text-sm text-[#b266ff]">
                    {profile.initials}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#f0f0f0] group-hover:text-white transition-colors">
                      {profile.name}
                    </h3>
                    <p className="text-xs font-mono text-[#a0a0a0]">{profile.role}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-[#ccff00]">
                  {profile.badge}
                </span>
              </div>

              {/* 1. Pinned Snippet Block */}
              <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 mb-3.5">
                <div className="flex items-center justify-between text-[11px] font-mono mb-1.5 text-[#52525b]">
                  <span className="flex items-center gap-1.5 text-[#ccff00]">
                    <Pin className="w-3 h-3 text-[#ccff00]" />
                    <span>PINNED SNIPPET</span>
                  </span>
                  <span className="text-[#a0a0a0]">{profile.pinnedSnippet.lang}</span>
                </div>
                <div className="text-xs font-mono font-semibold text-[#f0f0f0] mb-0.5">
                  {profile.pinnedSnippet.title}
                </div>
                <p className="text-[11px] text-[#a0a0a0] leading-snug">
                  {profile.pinnedSnippet.description}
                </p>
              </div>

              {/* 2. Shipped Together Timeline Block */}
              <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 mb-3.5">
                <div className="flex items-center justify-between text-[11px] font-mono mb-1.5 text-[#52525b]">
                  <span className="flex items-center gap-1.5 text-[#b266ff]">
                    <FolderGit2 className="w-3 h-3 text-[#b266ff]" />
                    <span>SHIPPED TOGETHER</span>
                  </span>
                  <span className="text-[#f0f0f0] font-bold">{profile.shippedTogether.roomsCount} rooms</span>
                </div>
                <p className="text-[11px] text-[#a0a0a0]">
                  Collaborated with {profile.shippedTogether.collaborators.join(", ")}
                </p>
              </div>

              {/* 3. SOS Track Record Block */}
              <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 mb-2">
                <div className="flex items-center justify-between text-[11px] font-mono mb-1.5 text-[#52525b]">
                  <span className="flex items-center gap-1.5 text-[#ccff00]">
                    <Terminal className="w-3 h-3 text-[#ccff00]" />
                    <span>DEBUG SOS RECORD</span>
                  </span>
                  <span className="text-[#ccff00] font-bold">{profile.sosTrackRecord.solved} solved</span>
                </div>
                <p className="text-[11px] text-[#a0a0a0]">
                  Specialization: {profile.sosTrackRecord.topArea}
                </p>
              </div>
            </div>

            {/* Card Footer Micro Action */}
            <div className="pt-4 border-t border-white/[0.06] mt-4 flex items-center justify-between text-xs font-mono">
              <span className="text-[#52525b]">PORTFOLIO SIGNAL</span>
              <Link
                to="/login?mode=signup"
                className="text-[#ccff00] hover:underline inline-flex items-center gap-1"
              >
                <span>View Profile</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* ── Section Bottom CTA ─────────────────────────────────────── */}
      <div className="text-center">
        <Link
          to="/login?mode=signup"
          className="bg-[#ccff00] hover:bg-[#d9ff33] text-black font-bold text-sm sm:text-base px-8 py-3.5 rounded-xl shadow-[0_0_20px_rgba(204,255,0,0.25)] hover:shadow-[0_0_30px_rgba(204,255,0,0.4)] transition-all duration-200 inline-flex items-center gap-2 active:scale-[0.98]"
        >
          <span>Build Your Verified Profile</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};

export default ProfileShowcaseBand;
