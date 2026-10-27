import React, { useState, useEffect } from "react";
import { Users, FolderGit2, CheckCircle2 } from "lucide-react";

/**
 * Feature F22: Community Band
 * 
 * - id="community"
 * - Fetches GET /public/stats
 * - Displays 3 live metrics: Developers, Open Projects, Completed Rooms
 * - Boundary rules:
 *   - Strictly unmounts (return null) if developers < 25
 *   - Strictly unmounts (return null) on catch / fetch failure
 */
const CommunityBand = () => {
  const [stats, setStats] = useState(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchStats() {
      try {
        const response = await fetch("/public/stats");
        if (!response.ok) {
          throw new Error("HTTP error fetching /public/stats");
        }
        const json = await response.json();
        if (isMounted) {
          const data = json.data || json;
          setStats(data);
        }
      } catch {
        if (isMounted) {
          setHasError(true);
        }
      }
    }

    fetchStats();
    return () => {
      isMounted = false;
    };
  }, []);

  // Gracefully unmount on error or before data resolves
  if (hasError || !stats) {
    return null;
  }

  const developers = Number(stats.developers ?? 0);
  const openProjects = Number(stats.openProjects ?? 0);
  const completedRooms = Number(stats.completedRooms ?? 0);

  // Boundary condition: If developers count is under 25, return null
  if (developers < 25) {
    return null;
  }

  const statItems = [
    {
      label: "Developers",
      value: developers.toLocaleString(),
      icon: Users,
      accent: "#ccff00",
      description: "Active builders and engineers",
    },
    {
      label: "Open Projects",
      value: openProjects.toLocaleString(),
      icon: FolderGit2,
      accent: "#b266ff",
      description: "Live repositories seeking peers",
    },
    {
      label: "Completed Rooms",
      value: completedRooms.toLocaleString(),
      icon: CheckCircle2,
      accent: "#f0f0f0",
      description: "Shipped collaborative sessions",
    },
  ];

  return (
    <section id="community" className="relative w-full py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-[#09090b]">
      {/* ── Section Header ─────────────────────────────────────────── */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#a0a0a0] uppercase tracking-wider mb-4">
          <span>Live Network Telemetry</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#f0f0f0] mb-4">
          Powered by a growing <span className="text-[#ccff00]">community</span>
        </h2>
        <p className="text-sm sm:text-base text-[#a0a0a0]">
          Real developers pairing across time zones to ship software faster.
        </p>
      </div>

      {/* ── 3 Stat Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="p-7 rounded-2xl bg-[#111113] border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col justify-between group shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono uppercase tracking-wider text-[#52525b]">
                  {item.label}
                </span>
                <div className="p-2 rounded-lg bg-white/5 text-[#a0a0a0] group-hover:text-white transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="font-mono text-4xl sm:text-5xl font-black text-[#f0f0f0] tracking-tight mb-2">
                {item.value}
              </div>

              <p className="text-xs text-[#52525b] font-mono">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CommunityBand;
