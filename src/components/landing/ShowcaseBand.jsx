import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { GitBranch, Users, ArrowRight, Code } from "lucide-react";

/**
 * Feature F23: Showcase Band
 * 
 * - id="showcase"
 * - Fetches GET /public/showcase
 * - While loading, renders 3 skeleton cards (animate-pulse)
 * - Boundary rules:
 *   - Strictly returns null when items.length === 0
 *   - Strictly returns null on fetch catch error
 * - Project card CTAs route strictly to /login?redirect=project
 */
const ShowcaseBand = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadShowcase() {
      try {
        const response = await fetch("/public/showcase");
        if (!response.ok) {
          throw new Error("HTTP error fetching /public/showcase");
        }
        const json = await response.json();
        if (isMounted) {
          const projectList = Array.isArray(json.data)
            ? json.data
            : Array.isArray(json)
            ? json
            : [];
          setItems(projectList);
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          setHasError(true);
          setLoading(false);
        }
      }
    }

    loadShowcase();
    return () => {
      isMounted = false;
    };
  }, []);

  // Gracefully unmount on error
  if (hasError) {
    return null;
  }

  // Boundary condition: If empty, unmount section
  if (!loading && items.length === 0) {
    return null;
  }

  return (
    <section id="showcase" className="relative w-full py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-[#09090b]">
      {/* ── Section Header ─────────────────────────────────────────── */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/25 text-xs font-mono text-[#ccff00] uppercase tracking-wider mb-4">
          <GitBranch className="w-3.5 h-3.5" />
          <span>Active Codebases</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#f0f0f0] mb-4">
          Open repositories <span className="text-[#ccff00]">seeking peers</span>
        </h2>
        <p className="text-sm sm:text-base text-[#a0a0a0]">
          Connect with builders shipping in production right now. Pick an open role and jump in.
        </p>
      </div>

      {/* ── Skeleton Loading State ──────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((skeletonId) => (
            <div
              key={skeletonId}
              className="p-7 rounded-2xl bg-[#111113] border border-white/10 animate-pulse space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 bg-white/10 rounded" />
                <div className="h-4 w-12 bg-white/10 rounded" />
              </div>
              <div className="h-6 w-3/4 bg-white/10 rounded" />
              <div className="h-16 w-full bg-white/5 rounded" />
              <div className="flex gap-2">
                <div className="h-5 w-16 bg-white/10 rounded-full" />
                <div className="h-5 w-16 bg-white/10 rounded-full" />
              </div>
              <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                <div className="h-8 w-8 rounded-full bg-white/10" />
                <div className="h-8 w-24 bg-white/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── Project Cards Grid ───────────────────────────────────── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((project) => (
            <div
              key={project._id || project.title}
              className="p-7 rounded-2xl bg-[#111113] border border-white/10 hover:border-[#ccff00]/40 transition-all duration-300 flex flex-col justify-between group shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-mono text-[#ccff00] bg-[#ccff00]/10 border border-[#ccff00]/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {project.stage || "Active Sprint"}
                  </span>
                  <span className="text-xs font-mono text-[#52525b]">
                    {project.commitment || "Pairing"}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#f0f0f0] mb-2 group-hover:text-white transition-colors">
                  {project.title || "Collaborative Project"}
                </h3>

                <p className="text-xs text-[#a0a0a0] mb-4">
                  Seeking: <span className="text-[#f0f0f0] font-mono font-medium">{project.roleNeeded || "Contributor"}</span>
                </p>

                {/* Tech stack tags */}
                {Array.isArray(project.techStack) && project.techStack.length > 0 && (
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
                )}
              </div>

              {/* Author & CTA Row */}
              <div className="pt-4 border-t border-white/[0.07] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {project.author?.photoUrl ? (
                    <img
                      src={project.author.photoUrl}
                      alt={project.author.firstName || "Author"}
                      className="w-7 h-7 rounded-full object-cover border border-white/10"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-mono text-[#a0a0a0]">
                      {project.author?.firstName ? project.author.firstName[0] : "P"}
                    </div>
                  )}
                  <span className="text-xs text-[#a0a0a0] font-mono">
                    {project.author?.firstName || "Builder"}
                  </span>
                </div>

                {/* Contract requirement: route to /login?redirect=project */}
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
      )}
    </section>
  );
};

export default ShowcaseBand;
