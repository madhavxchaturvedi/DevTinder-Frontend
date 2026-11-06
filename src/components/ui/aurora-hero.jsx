import React from "react";
import TwistingRibbon from "./twisting-ribbon";
import { cn } from "@/lib/utils";

/**
 * Aurora Hero with 3D Twisting Ribbon (Vivid & Clear Edition)
 * 
 * - Full opacity 3D Twisting Ribbon animation clearly visible across the viewport
 * - Dynamic neon colors (#ccff00 neo-lime and #c084fc violet)
 * - Gentle perimeter vignette allowing the ribbon to shine unobstructed
 */
export const AuroraHero = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "relative min-h-[85vh] sm:min-h-[92vh] w-full flex flex-col items-center justify-center overflow-hidden bg-[#09090b] text-white px-4 sm:px-6 lg:px-8",
        className
      )}
      {...props}
    >
      {/* ── 1. 3D Twisting Ribbon Canvas Animation (Fully Visible) ───── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <TwistingRibbon
            segments={450}
            waveSpeed={0.016}
            waveAmplitude={1.15}
            twistCycles={5}
            ribbonWidth={72}
            darkColors={{
              face: "#ccff00",
              foldA: "#bbf424",
              foldB: "#c084fc",
              foldC: "#7e22ce",
            }}
            className="w-full h-full opacity-100"
          />
        </div>

        {/* Soft Ambient Neon Glow Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[350px] bg-[#ccff00]/15 blur-[160px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[380px] bg-[#c084fc]/20 blur-[170px] rounded-full pointer-events-none" />
      </div>

      {/* ── 2. Subtle Edge Dissolve (Connecting to next section) ─────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 z-[1] bg-gradient-to-t from-[#09090b] via-[#09090b]/70 to-transparent"
      />

      {/* ── 3. Main Content Container (with high-legibility drop-shadow) */}
      <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center text-center font-sans">
        {children}
      </div>
    </div>
  );
};

export default AuroraHero;
