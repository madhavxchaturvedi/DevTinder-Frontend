import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FolderGit2, ArrowRight, ArrowLeft, GitBranch } from "lucide-react";

import ShowcaseBand from "../../components/landing/ShowcaseBand";
import FinalCtaSection from "../../components/landing/FinalCtaSection";

/**
 * Curated fallback showcase projects displayed if the live /public/showcase
 * API returns an empty array or encounters an error, ensuring the page is never blank.
 */
const FALLBACK_SHOWCASE_PROJECTS = [
  {
    _id: "fallback-mesh",
    stage: "Active Sprint",
    commitment: "Systems Co-Builder",
    title: "OctoMesh: WebRTC P2P Data Mesh",
    roleNeeded: "Systems Engineer (Rust/WebRTC)",
    techStack: ["Rust", "WebRTC", "Tokio", "TypeScript"],
    author: {
      firstName: "Elena",
      photoUrl: "",
    },
  },
  {
    _id: "fallback-ast",
    stage: "Architecture Phase",
    commitment: "Weekend Hack",
    title: "HyperGraph: Visual AST Query Engine",
    roleNeeded: "Compiler Engineer (Tree-sitter/Go)",
    techStack: ["Go", "Tree-sitter", "React", "Tailwind"],
    author: {
      firstName: "Marcus",
      photoUrl: "",
    },
  },
  {
    _id: "fallback-kubepulse",
    stage: "Production Beta",
    commitment: "Pairing & Review",
    title: "KubePulse: Ephemeral Container Observability",
    roleNeeded: "Full-Stack Dev (Next.js/Docker)",
    techStack: ["Node.js", "Docker", "TypeScript", "TailwindCSS"],
    author: {
      firstName: "Alex",
      photoUrl: "",
    },
  },
  {
    _id: "fallback-vectordb",
    stage: "Sprint 4",
    commitment: "Core Contributor",
    title: "VectorLens: Embedded HNSW Vector Index",
    roleNeeded: "C++ / SIMD Optimization Specialist",
    techStack: ["C++", "AVX-512", "Python", "CMake"],
    author: {
      firstName: "Maya",
      photoUrl: "",
    },
  },
  {
    _id: "fallback-authshield",
    stage: "Active Sprint",
    commitment: "Security Review",
    title: "AuthShield: Zero-Knowledge WebAuthn Provider",
    roleNeeded: "Cryptographer / Auth Specialist",
    techStack: ["TypeScript", "WebAuthn", "Node.js", "Redis"],
    author: {
      firstName: "David",
      photoUrl: "",
    },
  },
  {
    _id: "fallback-diffsync",
    stage: "Hackathon MVP",
    commitment: "UI/UX Co-Builder",
    title: "DiffSync: Visual Git Tree Conflict Resolver",
    roleNeeded: "Frontend Engineer (Canvas/React)",
    techStack: ["React", "HTML5 Canvas", "Tailwind", "Vite"],
    author: {
      firstName: "Sarah",
      photoUrl: "",
    },
  },
];

/**
 * FeaturesProjectsPage (/features/projects)
 *
 * Dedicated marketing sub-page for Open Developer Projects & Codebase Sprints.
 * Assembles:
 * - Hero header with FolderGit2 eyebrow badge, back navigation, and action CTAs
 * - ShowcaseBand: Dynamic showcase of active public repositories
 * - Graceful fallback showcase grid if API returns empty array / fails
 * - Inter-feature CTA link to /pricing
 * - Closing signup CTA banner routing to /login?mode=signup
 */
const FeaturesProjectsPage = () => {
  const [apiHasProjects, setApiHasProjects] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function checkShowcase() {
      try {
        const response = await fetch("/public/showcase");
        if (!response.ok) {
          throw new Error("HTTP error");
        }
        const json = await response.json();
        if (isMounted) {
          const list = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
          setApiHasProjects(list.length > 0);
        }
      } catch {
        if (isMounted) {
          setApiHasProjects(false);
        }
      }
    }

    checkShowcase();
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
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] max-w-full h-[280px] bg-[#b266ff]/[0.08] blur-[130px] pointer-events-none rounded-full"
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
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#b266ff]/10 border border-[#b266ff]/25 text-xs font-mono text-[#b266ff] uppercase tracking-wider mb-6 relative z-10">
          <FolderGit2 className="w-3.5 h-3.5" />
          <span>CURATED CODEBASES</span>
        </div>

        {/* Semantic Title (h2 to preserve single h1 invariant on root /) */}
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#f0f0f0] max-w-4xl mx-auto mb-6 leading-tight relative z-10">
          Open Developer Projects &amp; Sprints
        </h2>

        {/* Descriptive Subtitle */}
        <p className="text-base sm:text-lg text-[#a0a0a0] max-w-2xl mx-auto leading-relaxed mb-8 relative z-10 font-normal">
          Discover live codebases seeking co-builders, filter by tech stack and commitment, and jump into collaborative project rooms.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
          <Link
            to="/login?mode=signup"
            className="w-full sm:w-auto bg-[#ccff00] hover:bg-[#d9ff33] text-black font-bold font-mono text-sm px-6 py-3.5 rounded-xl transition-all duration-200 inline-flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(204,255,0,0.25)]"
          >
            <span>Start Pairing Free</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/pricing"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-[#f0f0f0] transition-colors inline-flex items-center justify-center gap-2"
          >
            <span>View Pricing Plans</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* ── Assembled Dynamic Showcase ─────────────────────────────── */}
      <ShowcaseBand />

      {/* ── Fallback Curated Showcase (Displayed if API returns empty / fails) ── */}
      {apiHasProjects === false && (
        <section className="relative w-full py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-[#09090b]">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/25 text-xs font-mono text-[#ccff00] uppercase tracking-wider mb-4">
              <GitBranch className="w-3.5 h-3.5" />
              <span>Curated Codebases</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#f0f0f0] mb-3">
              Featured Open <span className="text-[#ccff00]">Sprints</span>
            </h3>
            <p className="text-sm text-[#a0a0a0]">
              Hand-picked repositories seeking active contributors and systems architects right now.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FALLBACK_SHOWCASE_PROJECTS.map((project) => (
              <div
                key={project._id}
                className="p-7 rounded-2xl bg-[#111113] border border-white/10 hover:border-[#ccff00]/40 transition-all duration-300 flex flex-col justify-between group shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono text-[#ccff00] bg-[#ccff00]/10 border border-[#ccff00]/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {project.stage}
                    </span>
                    <span className="text-xs font-mono text-[#52525b]">
                      {project.commitment}
                    </span>
                  </div>

                  <h4 className="text-xl font-bold text-[#f0f0f0] mb-2 group-hover:text-white transition-colors">
                    {project.title}
                  </h4>

                  <p className="text-xs text-[#a0a0a0] mb-4">
                    Seeking: <span className="text-[#f0f0f0] font-mono font-medium">{project.roleNeeded}</span>
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-[#a0a0a0]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/[0.07] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-mono text-[#a0a0a0]">
                      {project.author.firstName[0]}
                    </div>
                    <span className="text-xs text-[#a0a0a0] font-mono">
                      {project.author.firstName}
                    </span>
                  </div>

                  <Link
                    to="/login?redirect=project"
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#ccff00] hover:text-[#d4ff33] group-hover:translate-x-1 transition-all"
                  >
                    <span>Pair on this</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Inter-Feature Navigation CTA ───────────────────────────── */}
      <section className="relative w-full py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="p-6 sm:p-8 rounded-2xl bg-[#111113] border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <span className="text-[11px] font-mono text-[#a0a0a0] uppercase tracking-wider block mb-1">
              Next Destination
            </span>
            <h3 className="text-xl font-bold text-[#f0f0f0]">
              Transparent Developer Pricing
            </h3>
            <p className="text-xs text-[#a0a0a0] mt-1">
              Explore predictable monthly and annual pricing plans engineered for developers.
            </p>
          </div>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-mono font-semibold text-[#f0f0f0] border border-white/15 transition-all group shrink-0"
          >
            <span>View Pricing Plans</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* ── Closing Banner CTA ─────────────────────────────────────── */}
      <FinalCtaSection />
    </div>
  );
};

export default FeaturesProjectsPage;
