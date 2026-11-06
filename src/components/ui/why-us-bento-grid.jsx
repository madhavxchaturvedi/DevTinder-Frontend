import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  MessageSquare,
  Terminal,
  GitBranch,
  Rocket,
  ChevronRight,
  Code2,
  Check,
  Database,
  Smartphone,
  Layout,
  Box,
  FileCode,
  HardDrive,
  Cloud,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Why Us Bento Grid (Vengeance UI Screenshot-Accurate Edition)
 * 
 * 5-Card Layout matching Vengeance UI preview:
 * - Card 1 (Top-Left): Real-Time Multiplayer IDE with 3D Floating Isometric Tile (Watermark 01)
 * - Card 2 (Top-Right): 6-layer fanned-out 3D Card Stack, border-0, terminal execution (Watermark 02)
 * - Card 3 (Middle-Left): 6-Avatar cluster with spring hover popouts & stack tooltips (Watermark 03)
 * - Card 4 (Middle-Center): 5-Step interactive pipeline with rocket launch badge (Watermark 04)
 * - Card 5 (Bottom Full-Width): True 3D rounded isometric extruded pyramid of 8 stack tiles with vertical dashed drop lines (Watermark 05)
 */
export const WhyUsBentoGrid = ({ className }) => {
  const [activeStep, setActiveStep] = useState(2);
  const [hoveredAvatar, setHoveredAvatar] = useState(null);
  const [cardsFanned, setCardsFanned] = useState(false);
  const [hoveredTile, setHoveredTile] = useState(null);

  const avatars = [
    { id: 1, name: "Sarah C.", stack: "Rust • Wasm", bg: "from-amber-400 to-orange-500", initials: "SC" },
    { id: 2, name: "Elena R.", stack: "TypeScript • React", bg: "from-emerald-400 to-teal-600", initials: "ER" },
    { id: 3, name: "David K.", stack: "Go • Cloud", bg: "from-blue-400 to-indigo-600", initials: "DK" },
    { id: 4, name: "Maya S.", stack: "Python • FastAPI", bg: "from-purple-400 to-pink-500", initials: "MS" },
    { id: 5, name: "Marcus L.", stack: "WebGL • Three.js", bg: "from-rose-400 to-red-600", initials: "ML" },
    { id: 6, name: "Alex V.", stack: "Next.js • Node", bg: "from-lime-400 to-green-600", initials: "AV" },
  ];

  const pipelineSteps = [
    { icon: Sparkles, label: "Match" },
    { icon: MessageSquare, label: "Chat" },
    { icon: Terminal, label: "Pair" },
    { icon: GitBranch, label: "Commit" },
    { icon: Rocket, label: "Launch", isLaunch: true },
  ];

  // 8 Isometric Tiles arranged in the inverted-V chevron pyramid of Box 5
  // Real developer engineering disciplines (zero AI fluff)
  // Center: cx = 270, cy = 38, dx = 54, dy = 30
  const isometricTiles = [
    { id: "fullstack", label: "Full Stack", u: 0, v: 0, x: 270, y: 38, Icon: Layers },
    { id: "backend", label: "Backend", u: 0, v: 1, x: 216, y: 68, Icon: Database },
    { id: "frontend", label: "Frontend", u: 1, v: 0, x: 324, y: 68, Icon: Layout },
    { id: "mobile", label: "Mobile", u: 0, v: 2, x: 162, y: 98, Icon: Smartphone },
    { id: "realtime", label: "Realtime", u: 1, v: 1, x: 270, y: 98, Icon: Box },
    { id: "devops", label: "DevOps", u: 2, v: 0, x: 378, y: 98, Icon: Cloud },
    { id: "systems", label: "Systems", u: 0, v: 3, x: 108, y: 128, Icon: Terminal },
    { id: "database", label: "Database", u: 3, v: 0, x: 432, y: 128, Icon: HardDrive },
  ];

  const groundBaseline = 215;

  return (
    <section id="features" className={cn("relative w-full py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto font-sans", className)}>
      {/* ── Outer Bento Container ───────────────────────────────────── */}
      <div className="rounded-[28px] border border-white/[0.08] bg-[#0c0c0e]/95 p-5 sm:p-7 backdrop-blur-2xl shadow-2xl space-y-5">
        
        {/* ── Top Grid Section (Left 7 Cols + Right 5 Cols) ───────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left Column (Spans 7 cols on desktop) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            
            {/* ── Card 1: Real-Time Multiplayer IDE ─────────────────────── */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.25 }}
              className="relative rounded-2xl bg-[#141417] border border-white/[0.08] hover:border-white/20 p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 overflow-hidden group shadow-lg min-h-[195px] transition-all"
            >
              {/* Background Watermark 01 */}
              <span className="absolute -bottom-4 right-4 text-7xl sm:text-8xl font-black font-mono text-white/[0.03] select-none pointer-events-none">
                01
              </span>

              {/* Card Text Content with Hover Font Color Motion */}
              <div className="relative z-10 max-w-sm">
                <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-[#ccff00] transition-colors duration-300 mb-2 tracking-tight">
                  Instant Multiplayer Rooms
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors duration-300 leading-relaxed">
                  Zero environment setup. Spin up a shared room with dual live cursors, integrated WebRTC audio, and an in-browser runtime that executes code instantly.
                </p>
              </div>

              {/* 3D Isometric Floating Tile with Physics Motion */}
              <motion.div
                animate={{
                  y: [-4, 4, -4],
                  rotateX: [52, 56, 52],
                  rotateZ: [-43, -47, -43],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 6,
                  ease: "easeInOut",
                }}
                className="relative z-10 shrink-0 self-center sm:self-auto [perspective:800px] cursor-pointer"
              >
                <div
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white shadow-[-10px_20px_40px_rgba(0,0,0,0.8)] flex items-center justify-center font-black text-2xl tracking-tighter text-[#ef4444] transition-transform duration-300 group-hover:scale-105"
                  style={{
                    boxShadow: "0 18px 24px -4px rgba(0,0,0,0.7), -10px 10px 0 #d4d4d8, -18px 18px 30px rgba(0,0,0,0.8)",
                  }}
                >
                  <span className="[transform:rotateZ(45deg)] font-black text-2xl tracking-tighter text-black flex items-center gap-1">
                    <Code2 className="w-7 h-7 text-[#ef4444]" />
                  </span>
                </div>
              </motion.div>
            </motion.div>

            {/* Row 2: Split into 2 Cards (Card 3 & Card 4) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* ── Card 3: Built by Experienced Engineers ────────────────── */}
              <motion.div
                whileHover={{ y: -3 }}
                transition={{ duration: 0.25 }}
                className="relative rounded-2xl bg-[#141417] border border-white/[0.08] hover:border-white/20 p-5 sm:p-6 flex flex-col justify-between overflow-hidden shadow-lg min-h-[225px] group transition-all"
              >
                {/* Background Watermark 03 */}
                <span className="absolute -bottom-4 right-3 text-7xl font-black font-mono text-white/[0.03] select-none pointer-events-none">
                  03
                </span>

                {/* Overlapping Avatar Cluster */}
                <div className="relative z-10 flex items-center mb-4 pt-1">
                  {avatars.map((av, idx) => (
                    <motion.div
                      key={av.id}
                      whileHover={{ scale: 1.25, zIndex: 30, y: -4 }}
                      onMouseEnter={() => setHoveredAvatar(av)}
                      onMouseLeave={() => setHoveredAvatar(null)}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className={cn(
                        "relative w-9 h-9 rounded-full bg-gradient-to-tr border-2 border-[#141417] shadow-sm flex items-center justify-center font-bold text-[10px] text-white shrink-0 cursor-pointer select-none",
                        idx > 0 && "-ml-2.5",
                        av.bg
                      )}
                    >
                      <span className="opacity-90">{av.initials}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Hover Tooltip Feedback */}
                <div className="h-4 mb-2">
                  <AnimatePresence mode="wait">
                    {hoveredAvatar && (
                      <motion.div
                        key={hoveredAvatar.id}
                        initial={{ opacity: 0, y: 2 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -2 }}
                        className="text-[11px] font-mono text-[#ccff00] font-medium"
                      >
                        {hoveredAvatar.name} • {hoveredAvatar.stack}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Content with Color Motion */}
                <div className="relative z-10">
                  <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-[#ccff00] transition-colors duration-300 mb-1.5 tracking-tight">
                    Filtered by Proof of Work
                  </h4>
                  <p className="text-xs text-neutral-400 group-hover:text-neutral-300 transition-colors duration-300 leading-relaxed">
                    Skip the resume fluff. Discover co-builders by active GitHub commits, shipped repos, and the exact stacks they build with every day.
                  </p>
                </div>
              </motion.div>

              {/* ── Card 4: No Meetings. Just Code. ──────────────────────── */}
              <motion.div
                whileHover={{ y: -3 }}
                transition={{ duration: 0.25 }}
                className="relative rounded-2xl bg-[#141417] border border-white/[0.08] hover:border-white/20 p-5 sm:p-6 flex flex-col justify-between overflow-hidden shadow-lg min-h-[225px] group transition-all"
              >
                {/* Background Watermark 04 */}
                <span className="absolute -bottom-4 right-3 text-7xl font-black font-mono text-white/[0.03] select-none pointer-events-none">
                  04
                </span>

                {/* 5-Step Pipeline */}
                <div className="relative z-10 flex items-center justify-between text-[9px] font-mono mb-4 pt-1">
                  {pipelineSteps.map((step, idx) => {
                    const Icon = step.icon;
                    const isSelected = activeStep === idx;
                    const isPassed = activeStep > idx;

                    return (
                      <React.Fragment key={step.label}>
                        <motion.div
                          onClick={() => setActiveStep(idx)}
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex flex-col items-center gap-1 cursor-pointer"
                        >
                          {step.isLaunch ? (
                            <div className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300",
                              isSelected
                                ? "bg-[#ccff00] text-black shadow-[0_0_15px_#ccff00]"
                                : "bg-white/10 text-white border border-white/20"
                            )}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                          ) : (
                            <div className={cn(
                              "w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200",
                              isSelected
                                ? "bg-white text-black font-bold shadow-md"
                                : isPassed
                                ? "bg-neutral-800 text-[#ccff00] border border-[#ccff00]/40"
                                : "bg-white/5 text-neutral-400 border border-white/10"
                            )}>
                              {isPassed ? <Check className="w-2.5 h-2.5" /> : <Icon className="w-2.5 h-2.5" />}
                            </div>
                          )}
                          <span className={cn(
                            "text-[8px] uppercase font-semibold transition-colors",
                            isSelected ? "text-white font-bold" : "text-neutral-500"
                          )}>
                            {step.label}
                          </span>
                        </motion.div>

                        {idx < pipelineSteps.length - 1 && (
                          <ChevronRight className={cn(
                            "w-2.5 h-2.5 -mx-1 transition-colors",
                            isPassed ? "text-[#ccff00]/80" : "text-neutral-700"
                          )} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Content with Color Motion */}
                <div className="relative z-10">
                  <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-[#ccff00] transition-colors duration-300 mb-1.5 tracking-tight">
                    No Meetings. Just Code.
                  </h4>
                  <p className="text-xs text-neutral-400 group-hover:text-neutral-300 transition-colors duration-300 leading-relaxed">
                    Skip the awkward coffee chats and pitch decks. Connect on a shared problem, open a live room, and test how you collaborate in real time.
                  </p>
                </div>
              </motion.div>

            </div>
          </div>

          {/* ── Card 2: Top-Right (Fanned 3D Cards Stack - border-0) ───── */}
          <motion.div
            whileHover={{ y: -3 }}
            onHoverStart={() => setCardsFanned(true)}
            onHoverEnd={() => setCardsFanned(false)}
            transition={{ duration: 0.25 }}
            className="lg:col-span-5 rounded-2xl bg-[#141417] border-0 p-6 sm:p-7 flex flex-col justify-between overflow-hidden shadow-xl relative min-h-[440px] group transition-all cursor-pointer"
          >
            {/* Background Watermark 02 */}
            <span className="absolute -bottom-8 -right-2 text-[140px] font-bold font-mono text-white/[0.04] select-none pointer-events-none leading-none">
              02
            </span>

            {/* Fanned-out Multi-Layer 3D Card Stack */}
            <div className="relative z-10 w-full flex items-center justify-center pt-2 pb-6 [perspective:1000px]">
              <div className="relative w-56 h-48 sm:w-64 sm:h-56">
                
                {/* Layer 6 */}
                <motion.div
                  animate={{
                    rotate: cardsFanned ? -24 : -18,
                    x: cardsFanned ? -22 : -16,
                    y: cardsFanned ? 20 : 16,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="absolute inset-0 rounded-2xl bg-[#52525b] shadow-lg opacity-40 border-0"
                />

                {/* Layer 5 */}
                <motion.div
                  animate={{
                    rotate: cardsFanned ? -19 : -14,
                    x: cardsFanned ? -17 : -12,
                    y: cardsFanned ? 16 : 12,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="absolute inset-0 rounded-2xl bg-[#71717a] shadow-lg opacity-55 border-0"
                />

                {/* Layer 4 */}
                <motion.div
                  animate={{
                    rotate: cardsFanned ? -14 : -10,
                    x: cardsFanned ? -12 : -8,
                    y: cardsFanned ? 12 : 9,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="absolute inset-0 rounded-2xl bg-[#a1a1aa] shadow-lg opacity-70 border-0"
                />

                {/* Layer 3 */}
                <motion.div
                  animate={{
                    rotate: cardsFanned ? -9 : -6,
                    x: cardsFanned ? -8 : -5,
                    y: cardsFanned ? 8 : 6,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="absolute inset-0 rounded-2xl bg-[#d4d4d8] shadow-md opacity-85 border-0"
                />

                {/* Layer 2 */}
                <motion.div
                  animate={{
                    rotate: cardsFanned ? -4 : -2.5,
                    x: cardsFanned ? -4 : -2,
                    y: cardsFanned ? 4 : 3,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="absolute inset-0 rounded-2xl bg-[#e4e4e7] shadow-md opacity-95 border-0"
                />
                
                {/* Foreground Card 1 */}
                <motion.div
                  animate={{
                    scale: cardsFanned ? 1.02 : 1,
                    y: cardsFanned ? -4 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="absolute inset-0 rounded-2xl bg-white text-black p-6 shadow-2xl flex flex-col justify-between border-0 overflow-hidden"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)
                    `,
                    backgroundSize: "1.1rem 1.1rem",
                  }}
                >
                  {/* Three Pill-shaped Dots */}
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-3.5 rounded-full bg-black" />
                    <span className="w-2.5 h-3.5 rounded-full bg-black" />
                    <span className="w-2.5 h-3.5 rounded-full bg-[#a1a1aa]" />
                  </div>

                  {/* High-Impact Typography with Periods */}
                  <div className="space-y-0.5 font-black text-2xl sm:text-[26px] tracking-tight leading-[1.08] text-black font-sans">
                    <p>Idea.</p>
                    <p>Architecture.</p>
                    <p>Production.</p>
                  </div>

                  {/* Terminal Execution Line with Blinking Cursor */}
                  <div className="font-mono text-[10px] text-neutral-600 tracking-wider uppercase font-semibold flex items-center gap-1">
                    <span>&gt; READY TO EXECUTE</span>
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="w-1.5 h-3 bg-neutral-700 inline-block"
                    />
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Bottom Content with Color Motion */}
            <div className="relative z-10 pt-4">
              <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-[#ccff00] transition-colors duration-300 mb-2 tracking-tight">
                From Pitch to Production
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors duration-300 leading-relaxed">
                Don&apos;t let ideas die in draft notes. Find a co-builder whose strengths cover your blind spots, architect the system together, and push all the way to launch.
              </p>
            </div>
          </motion.div>

        </div>

        {/* ── Card 5: Bottom Full-Width Card (Complementary Stacks with 3D Rounded Isometric Pyramid Tree) ── */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.25 }}
          className="relative rounded-2xl bg-[#141417] border border-white/[0.08] hover:border-white/20 p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 overflow-hidden shadow-lg group transition-all"
        >
          {/* Background Watermark 05 (Positioned in bottom right behind graphics) */}
          <span className="absolute -bottom-8 right-6 text-[140px] sm:text-[160px] font-bold font-mono text-white/[0.035] select-none pointer-events-none leading-none">
            05
          </span>

          {/* Left Text Content with Color Motion */}
          <div className="relative z-10 max-w-md">
            <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-[#ccff00] transition-colors duration-300 mb-2 tracking-tight">
              Complementary Stacks. Zero Blindspots.
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors duration-300 leading-relaxed">
              Frontend specialists teaming up with backend architects. Systems engineers pairing with UI designers. Mobile devs collaborating on real-time APIs. Find the exact counterpart your codebase needs.
            </p>
          </div>

          {/* Right: Screenshot-Accurate 3D Rounded Isometric Pyramid Tree with Vertical Dashed Drop Lines */}
          <div className="relative z-10 w-full lg:w-auto flex items-center justify-center py-2">
            <div className="w-full max-w-[540px] h-[230px] sm:h-[245px] relative">
              <svg
                viewBox="0 0 540 225"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full overflow-visible select-none"
              >
                {/* 1. Base Ground Dotted Grid Reference Line */}
                <line
                  x1="70"
                  y1={groundBaseline}
                  x2="470"
                  y2={groundBaseline}
                  stroke="rgba(255,255,255,0.1)"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />

                {/* 2. Vertical Dashed Drop Lines (2 lines per tile connecting downward to ground baseline) */}
                {isometricTiles.map((tile) => {
                  const isHovered = hoveredTile === tile.id;
                  const startY = tile.y + 14;
                  return (
                    <g key={`lines-${tile.id}`}>
                      {/* Left vertical dashed line */}
                      <line
                        x1={tile.x - 7}
                        y1={startY}
                        x2={tile.x - 7}
                        y2={groundBaseline}
                        stroke={isHovered ? "rgba(204,255,0,0.6)" : "rgba(255,255,255,0.22)"}
                        strokeWidth="1.2"
                        strokeDasharray="2.5 3"
                        className="transition-colors duration-200"
                      />
                      {/* Right vertical dashed line */}
                      <line
                        x1={tile.x + 7}
                        y1={startY}
                        x2={tile.x + 7}
                        y2={groundBaseline}
                        stroke={isHovered ? "rgba(204,255,0,0.6)" : "rgba(255,255,255,0.22)"}
                        strokeWidth="1.2"
                        strokeDasharray="2.5 3"
                        className="transition-colors duration-200"
                      />
                    </g>
                  );
                })}

                {/* 3. 3D Rounded Isometric Extruded Tiles (rendered back-to-front by y) */}
                {isometricTiles.map((tile) => {
                  const isHovered = hoveredTile === tile.id;
                  const Icon = tile.Icon;
                  // Dynamic lift on hover
                  const curY = isHovered ? tile.y - 4 : tile.y;

                  return (
                    <g
                      key={tile.id}
                      onMouseEnter={() => setHoveredTile(tile.id)}
                      onMouseLeave={() => setHoveredTile(null)}
                      className="cursor-pointer transition-all duration-200"
                    >
                      {/* 3D Extrusion Depth Stack (Smooth curved isometric bevel) */}
                      {/* Layer 4: Deep Shadow Base */}
                      <g transform={`translate(${tile.x}, ${curY + 8}) scale(1, 0.58) rotate(45)`}>
                        <rect
                          x="-22"
                          y="-22"
                          width="44"
                          height="44"
                          rx="9"
                          fill={isHovered ? "#64748b" : "#475569"}
                          opacity="0.8"
                        />
                      </g>
                      {/* Layer 3: Dark Extruded Shading */}
                      <g transform={`translate(${tile.x}, ${curY + 6}) scale(1, 0.58) rotate(45)`}>
                        <rect
                          x="-22"
                          y="-22"
                          width="44"
                          height="44"
                          rx="9"
                          fill={isHovered ? "#94a3b8" : "#64748b"}
                        />
                      </g>
                      {/* Layer 2: Mid Extruded Shading */}
                      <g transform={`translate(${tile.x}, ${curY + 3.5}) scale(1, 0.58) rotate(45)`}>
                        <rect
                          x="-22"
                          y="-22"
                          width="44"
                          height="44"
                          rx="9"
                          fill={isHovered ? "#cbd5e1" : "#94a3b8"}
                        />
                      </g>
                      {/* Layer 1: Light Bevel Upper Lip */}
                      <g transform={`translate(${tile.x}, ${curY + 1.5}) scale(1, 0.58) rotate(45)`}>
                        <rect
                          x="-22"
                          y="-22"
                          width="44"
                          height="44"
                          rx="9"
                          fill={isHovered ? "#e2e8f0" : "#cbd5e1"}
                        />
                      </g>

                      {/* Top Face: Solid Pure White Rounded Tile */}
                      <g
                        transform={`translate(${tile.x}, ${curY}) scale(1, 0.58) rotate(45)`}
                        style={{
                          filter: isHovered
                            ? "drop-shadow(0 0 12px rgba(204,255,0,0.5))"
                            : "drop-shadow(0 3px 5px rgba(0,0,0,0.35))",
                        }}
                      >
                        <rect
                          x="-22"
                          y="-22"
                          width="44"
                          height="44"
                          rx="9"
                          fill={isHovered ? "#ffffff" : "#ffffff"}
                          stroke={isHovered ? "#ccff00" : "rgba(255,255,255,0.9)"}
                          strokeWidth={isHovered ? "1.8" : "0.5"}
                        />
                      </g>

                      {/* Icon on Top Face (Center Aligned, Scaled for Isometric Plane) */}
                      <g
                        transform={`translate(${tile.x}, ${curY - 3})`}
                        className="pointer-events-none select-none"
                      >
                        <foreignObject x="-9" y="-9" width="18" height="18">
                          <div className="w-full h-full flex items-center justify-center">
                            <Icon
                              className={cn(
                                "w-3.5 h-3.5 transition-colors duration-200",
                                isHovered ? "text-[#18181b] stroke-[2.2]" : "text-[#52525b] stroke-[1.8]"
                              )}
                            />
                          </div>
                        </foreignObject>
                      </g>

                      {/* Label on Top Face (Clean Microcopy Under Icon) */}
                      <text
                        x={tile.x}
                        y={curY + 8}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill={isHovered ? "#000000" : "#27272a"}
                        fontSize="7.5"
                        fontWeight="700"
                        fontFamily="system-ui, -apple-system, sans-serif"
                        letterSpacing="-0.02em"
                        className="pointer-events-none select-none transition-colors duration-200"
                      >
                        {tile.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default WhyUsBentoGrid;
