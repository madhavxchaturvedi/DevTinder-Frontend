import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Terminal } from "lucide-react";
import MultiplayerCursor from "./MultiplayerCursor";

/**
 * HeroMockEditor (Feature F14)
 * 
 * High-performance, pure React/HTML/CSS simulated collaborative code editor.
 * STRICT CONSTRAINTS:
 *  - ZERO heavy external IDE packages. Pure React + HTML + CSS.
 *  - macOS traffic lights (#ff5f56, #ffbd2e, #27c93f).
 *  - File tab bar with active tab pair_session.ts and secondary tab types.ts.
 *  - Live peer status pill with live count indicator: LIVE PEERS (2).
 *  - Scripted 10-second typing loop across simulated developers:
 *      * Alex: lime (#ccff00) cursor & typing
 *      * Elena: purple (#b266ff) cursor & typing
 *  - Integrated terminal pane showing sync and test output.
 *  - id="hero-mock-editor" for multiplayer cursor binding.
 *  - prefers-reduced-motion support (static complete view).
 */

const LOOP_DURATION = 10000; // 10 seconds total cycle

// Static line tokens definition for pair_session.ts
const STATIC_HEADER_LINES = [
  // Line 1
  [
    { text: "import", cls: "text-[#b266ff] font-semibold" },
    { text: " { ", cls: "text-zinc-400" },
    { text: "DataChannel", cls: "text-[#38bdf8]" },
    { text: " } ", cls: "text-zinc-400" },
    { text: "from", cls: "text-[#b266ff] font-semibold" },
    { text: " ", cls: "text-zinc-400" },
    { text: '"@octopair/sync"', cls: "text-[#ccff00]" },
    { text: ";", cls: "text-zinc-400" },
  ],
  // Line 2
  [
    { text: "import", cls: "text-[#b266ff] font-semibold" },
    { text: " type", cls: "text-[#b266ff] font-semibold" },
    { text: " { ", cls: "text-zinc-400" },
    { text: "RoomState", cls: "text-[#38bdf8]" },
    { text: " } ", cls: "text-zinc-400" },
    { text: "from", cls: "text-[#b266ff] font-semibold" },
    { text: " ", cls: "text-zinc-400" },
    { text: '"./types"', cls: "text-[#ccff00]" },
    { text: ";", cls: "text-zinc-400" },
  ],
  // Line 3 (blank)
  [],
  // Line 4
  [
    { text: "export", cls: "text-[#b266ff] font-semibold" },
    { text: " ", cls: "text-zinc-400" },
    { text: "async", cls: "text-[#b266ff] font-semibold" },
    { text: " ", cls: "text-zinc-400" },
    { text: "function", cls: "text-[#b266ff] font-semibold" },
    { text: " ", cls: "text-zinc-400" },
    { text: "syncSession", cls: "text-[#60a5fa]" },
    { text: "(", cls: "text-zinc-400" },
    { text: "roomId", cls: "text-[#f0f0f0]" },
    { text: ": ", cls: "text-zinc-400" },
    { text: "string", cls: "text-[#38bdf8]" },
    { text: "): ", cls: "text-zinc-400" },
    { text: "Promise", cls: "text-[#38bdf8]" },
    { text: "<", cls: "text-zinc-400" },
    { text: "RoomState", cls: "text-[#38bdf8]" },
    { text: "> {", cls: "text-zinc-400" },
  ],
  // Line 5
  [
    { text: "  const", cls: "text-[#b266ff] font-semibold" },
    { text: " ", cls: "text-zinc-400" },
    { text: "channel", cls: "text-[#f0f0f0]" },
    { text: " = ", cls: "text-zinc-400" },
    { text: "await", cls: "text-[#b266ff] font-semibold" },
    { text: " ", cls: "text-zinc-400" },
    { text: "DataChannel", cls: "text-[#38bdf8]" },
    { text: ".", cls: "text-zinc-400" },
    { text: "connect", cls: "text-[#60a5fa]" },
    { text: "({ ", cls: "text-zinc-400" },
    { text: "room", cls: "text-[#f0f0f0]" },
    { text: ": ", cls: "text-zinc-400" },
    { text: "roomId", cls: "text-[#f0f0f0]" },
    { text: " });", cls: "text-zinc-400" },
  ],
  // Line 6
  [
    { text: "  // [WebRTC mesh active: 18ms latency]", cls: "text-[#52525b] italic" },
  ],
];

// Lines typed by Alex in Phase 1 (Lines 7, 8, 9)
const ALEX_LINES = [
  // Line 7
  [
    { text: "  channel", cls: "text-[#f0f0f0]" },
    { text: ".", cls: "text-zinc-400" },
    { text: "onSync", cls: "text-[#60a5fa]" },
    { text: "((", cls: "text-zinc-400" },
    { text: "delta", cls: "text-[#38bdf8]" },
    { text: ") => {", cls: "text-zinc-400" },
  ],
  // Line 8
  [
    { text: "    applyRemoteAST", cls: "text-[#60a5fa]" },
    { text: "(", cls: "text-zinc-400" },
    { text: "delta", cls: "text-[#38bdf8]" },
    { text: ");", cls: "text-zinc-400" },
  ],
  // Line 9
  [
    { text: "  });", cls: "text-zinc-400" },
  ],
];

// Lines typed by Elena in Phase 2 (Lines 10, 11)
const ELENA_LINES = [
  // Line 10
  [
    { text: "  // Elena: Verified peer latency <18ms", cls: "text-[#52525b] italic" },
  ],
  // Line 11
  [
    { text: "  return", cls: "text-[#b266ff] font-semibold" },
    { text: " ", cls: "text-zinc-400" },
    { text: "channel", cls: "text-[#f0f0f0]" },
    { text: ".", cls: "text-zinc-400" },
    { text: "getState", cls: "text-[#60a5fa]" },
    { text: "();", cls: "text-zinc-400" },
  ],
];

// Static closing Line 12
const STATIC_FOOTER_LINE = [
  { text: "}", cls: "text-zinc-400" },
];

// Static definitions for types.ts tab
const TYPES_TAB_LINES = [
  [
    { text: "export", cls: "text-[#b266ff] font-semibold" },
    { text: " ", cls: "text-zinc-400" },
    { text: "interface", cls: "text-[#b266ff] font-semibold" },
    { text: " ", cls: "text-zinc-400" },
    { text: "Peer", cls: "text-[#38bdf8]" },
    { text: " {", cls: "text-zinc-400" },
  ],
  [
    { text: "  id", cls: "text-[#f0f0f0]" },
    { text: ": ", cls: "text-zinc-400" },
    { text: "string", cls: "text-[#38bdf8]" },
    { text: ";", cls: "text-zinc-400" },
  ],
  [
    { text: "  name", cls: "text-[#f0f0f0]" },
    { text: ": ", cls: "text-zinc-400" },
    { text: "string", cls: "text-[#38bdf8]" },
    { text: ";", cls: "text-zinc-400" },
  ],
  [
    { text: "  cursorColor", cls: "text-[#f0f0f0]" },
    { text: ": ", cls: "text-zinc-400" },
    { text: "string", cls: "text-[#38bdf8]" },
    { text: ";", cls: "text-zinc-400" },
  ],
  [
    { text: "}", cls: "text-zinc-400" },
  ],
  [],
  [
    { text: "export", cls: "text-[#b266ff] font-semibold" },
    { text: " ", cls: "text-zinc-400" },
    { text: "interface", cls: "text-[#b266ff] font-semibold" },
    { text: " ", cls: "text-zinc-400" },
    { text: "RoomState", cls: "text-[#38bdf8]" },
    { text: " {", cls: "text-zinc-400" },
  ],
  [
    { text: "  roomId", cls: "text-[#f0f0f0]" },
    { text: ": ", cls: "text-zinc-400" },
    { text: "string", cls: "text-[#38bdf8]" },
    { text: ";", cls: "text-zinc-400" },
  ],
  [
    { text: "  peers", cls: "text-[#f0f0f0]" },
    { text: ": ", cls: "text-zinc-400" },
    { text: "Peer", cls: "text-[#38bdf8]" },
    { text: "[];", cls: "text-zinc-400" },
  ],
  [
    { text: "  latencyMs", cls: "text-[#f0f0f0]" },
    { text: ": ", cls: "text-zinc-400" },
    { text: "number", cls: "text-[#38bdf8]" },
    { text: ";", cls: "text-zinc-400" },
  ],
  [
    { text: "  synced", cls: "text-[#f0f0f0]" },
    { text: ": ", cls: "text-zinc-400" },
    { text: "boolean", cls: "text-[#38bdf8]" },
    { text: ";", cls: "text-zinc-400" },
  ],
  [
    { text: "}", cls: "text-zinc-400" },
  ],
];

// Helper to count total characters across an array of line tokens
function countTotalChars(lines) {
  return lines.reduce(
    (sum, line) => sum + line.reduce((lSum, t) => lSum + t.text.length, 0),
    0
  );
}

const TOTAL_ALEX_CHARS = countTotalChars(ALEX_LINES); // 59
const TOTAL_ELENA_CHARS = countTotalChars(ELENA_LINES); // 67

// Render individual token slices with active cursor badge
const CursorElement = ({ color, name }) => (
  <span className="relative inline-flex items-center mx-[1px] select-none pointer-events-none align-middle">
    <span
      className="inline-block w-[2px] h-[16px] animate-pulse rounded-full"
      style={{ backgroundColor: color }}
    />
    <span
      className="absolute -top-4 left-0 px-1 py-[1px] rounded text-[9px] font-mono font-bold leading-none shadow-md z-10 whitespace-nowrap"
      style={{
        backgroundColor: color,
        color: color === "#ccff00" ? "#000000" : "#ffffff",
      }}
    >
      {name}
    </span>
  </span>
);

function renderTokens(tokens, typedCount, isCursorActive, cursorColor, cursorName) {
  let remainingBudget = typedCount;
  let cursorPlaced = false;
  const elements = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (remainingBudget <= 0) break;

    if (remainingBudget >= token.text.length) {
      elements.push(
        <span key={i} className={token.cls}>
          {token.text}
        </span>
      );
      remainingBudget -= token.text.length;
    } else {
      // Partially typed token
      elements.push(
        <span key={i} className={token.cls}>
          {token.text.slice(0, remainingBudget)}
        </span>
      );
      if (isCursorActive && !cursorPlaced) {
        elements.push(
          <CursorElement key="cursor" color={cursorColor} name={cursorName} />
        );
        cursorPlaced = true;
      }
      remainingBudget = 0;
      break;
    }
  }

  // If line is complete and cursor belongs at end
  if (isCursorActive && !cursorPlaced && remainingBudget === 0 && typedCount > 0) {
    elements.push(
      <CursorElement key="cursor" color={cursorColor} name={cursorName} />
    );
  }

  return elements;
}

export default function HeroMockEditor({
  className = "",
  children,
  ...rest
}) {
  const containerRef = useRef(null);
  const [activeTab, setActiveTab] = useState("pair_session.ts");
  const [timeMs, setTimeMs] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Guest multiplayer cursor tracking
  const [guestCursorPos, setGuestCursorPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);

  // Check prefers-reduced-motion safely
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      setIsReducedMotion(mq.matches);
      const listener = (e) => setIsReducedMotion(e.matches);
      mq.addEventListener?.("change", listener);
      return () => mq.removeEventListener?.("change", listener);
    }
  }, []);

  // Check pointer coarse (touch devices)
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      const coarseMq = window.matchMedia("(pointer: coarse)");
      setIsCoarsePointer(coarseMq.matches);
      const listener = (e) => setIsCoarsePointer(e.matches);
      coarseMq.addEventListener?.("change", listener);
      return () => coarseMq.removeEventListener?.("change", listener);
    }
  }, []);

  // 10-second typing loop
  useEffect(() => {
    if (isReducedMotion) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) % LOOP_DURATION;
      setTimeMs(elapsed);
    }, 50);

    return () => clearInterval(interval);
  }, [isReducedMotion]);

  // Mouse event handlers for container-relative multiplayer cursor
  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current || isCoarsePointer) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    setGuestCursorPos({ x, y });
  }, [isCoarsePointer]);

  const handleMouseEnter = useCallback((e) => {
    if (isCoarsePointer) return;
    setIsHovered(true);
    handleMouseMove(e);
  }, [isCoarsePointer, handleMouseMove]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // Compute loop phase values
  const { alexBudget, elenaBudget, showTests, activeCursor } = useMemo(() => {
    if (isReducedMotion) {
      return {
        alexBudget: TOTAL_ALEX_CHARS,
        elenaBudget: TOTAL_ELENA_CHARS,
        showTests: true,
        activeCursor: null,
      };
    }

    // Phase 0: 0ms - 1200ms -> Ready state, Alex cursor resting at Line 7
    if (timeMs < 1200) {
      return {
        alexBudget: 0,
        elenaBudget: 0,
        showTests: false,
        activeCursor: "alex_start",
      };
    }

    // Phase 1: 1200ms - 4500ms (3300ms) -> Alex types lines 7-9
    if (timeMs < 4500) {
      const ratio = (timeMs - 1200) / 3300;
      const budget = Math.min(TOTAL_ALEX_CHARS, Math.floor(ratio * TOTAL_ALEX_CHARS));
      return {
        alexBudget: budget,
        elenaBudget: 0,
        showTests: false,
        activeCursor: "alex",
      };
    }

    // Phase 2: 4500ms - 7500ms (3000ms) -> Elena types lines 10-11
    if (timeMs < 7500) {
      const ratio = (timeMs - 4500) / 3000;
      const budget = Math.min(TOTAL_ELENA_CHARS, Math.floor(ratio * TOTAL_ELENA_CHARS));
      return {
        alexBudget: TOTAL_ALEX_CHARS,
        elenaBudget: budget,
        showTests: false,
        activeCursor: "elena",
      };
    }

    // Phase 3: 7500ms - 9200ms (1700ms) -> AST sync + Tests passing output
    if (timeMs < 9200) {
      return {
        alexBudget: TOTAL_ALEX_CHARS,
        elenaBudget: TOTAL_ELENA_CHARS,
        showTests: true,
        activeCursor: "elena_done",
      };
    }

    // Phase 4: 9200ms - 10000ms (800ms) -> Settle and loop reset
    return {
      alexBudget: TOTAL_ALEX_CHARS,
      elenaBudget: TOTAL_ELENA_CHARS,
      showTests: true,
      activeCursor: null,
    };
  }, [timeMs, isReducedMotion]);

  // Distribute Alex budget across Lines 7, 8, 9
  const line7Budget = Math.min(28, alexBudget);
  const line8Budget = Math.max(0, Math.min(26, alexBudget - 28));
  const line9Budget = Math.max(0, Math.min(5, alexBudget - 54));

  // Determine which Alex line currently holds the cursor
  const isLine7Cursor = activeCursor === "alex_start" || (activeCursor === "alex" && alexBudget <= 28);
  const isLine8Cursor = activeCursor === "alex" && alexBudget > 28 && alexBudget <= 54;
  const isLine9Cursor = activeCursor === "alex" && alexBudget > 54 && alexBudget <= 59;

  // Distribute Elena budget across Lines 10, 11
  const line10Budget = Math.min(39, elenaBudget);
  const line11Budget = Math.max(0, Math.min(28, elenaBudget - 39));

  // Determine which Elena line currently holds the cursor
  const isLine10Cursor = activeCursor === "elena" && elenaBudget <= 39;
  const isLine11Cursor = (activeCursor === "elena" && elenaBudget > 39) || activeCursor === "elena_done";

  const showCustomCursor = isHovered && !isCoarsePointer;

  return (
    <div
      ref={containerRef}
      id="hero-mock-editor"
      className={`relative w-full max-w-4xl mx-auto rounded-2xl bg-[#111113] border border-white/10 shadow-2xl overflow-hidden flex flex-col font-mono text-xs sm:text-sm select-none ${
        showCustomCursor ? "cursor-none" : ""
      } ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      {/* ── Guest Multiplayer Cursor Overlay ──────────────────────────────── */}
      <MultiplayerCursor
        position={guestCursorPos}
        visible={showCustomCursor}
        label="You (Guest)"
        color="#ccff00"
      />

      {/* ── Editor Chrome / Header ────────────────────────────────────────── */}
      <div className="h-10 sm:h-11 bg-[#0d0d0f] border-b border-white/[0.08] px-4 flex items-center justify-between">
        {/* macOS Traffic Lights */}
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block border border-[#e0443e]/40 shadow-sm" />
          <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block border border-[#dea123]/40 shadow-sm" />
          <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block border border-[#1aab29]/40 shadow-sm" />
        </div>

        {/* File Tabs */}
        <div className="flex items-center gap-1.5 ml-4 sm:ml-6 flex-1 overflow-x-auto">
          {/* pair_session.ts (Active Tab) */}
          <button
            type="button"
            onClick={() => setActiveTab("pair_session.ts")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-t-md text-xs font-mono transition-colors ${
              activeTab === "pair_session.ts"
                ? "bg-[#111113] text-[#f0f0f0] border-t border-x border-white/10 border-b-2 border-b-[#ccff00] font-medium"
                : "text-[#52525b] hover:text-[#a0a0a0] bg-transparent"
            }`}
          >
            <span className="text-[10px] font-bold text-[#3178c6] bg-[#3178c6]/15 px-1 py-0.5 rounded leading-none">
              TS
            </span>
            <span>pair_session.ts</span>
            {activeTab === "pair_session.ts" && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00]" />
            )}
          </button>

          {/* types.ts (Secondary Tab) */}
          <button
            type="button"
            onClick={() => setActiveTab("types.ts")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-t-md text-xs font-mono transition-colors ${
              activeTab === "types.ts"
                ? "bg-[#111113] text-[#f0f0f0] border-t border-x border-white/10 border-b-2 border-b-[#b266ff] font-medium"
                : "text-[#52525b] hover:text-[#a0a0a0] bg-transparent"
            }`}
          >
            <span className="text-[10px] font-bold text-[#3178c6]/70 bg-[#3178c6]/10 px-1 py-0.5 rounded leading-none">
              TS
            </span>
            <span>types.ts</span>
          </button>
        </div>

        {/* Live Peer Status & Collaborators */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] text-[10px] sm:text-[11px] font-mono font-bold tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ccff00] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ccff00]" />
            </span>
            <span>LIVE PEERS (2)</span>
          </div>

          {/* Collaborator Avatars */}
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-black/40 border border-[#ccff00]/30 text-[#ccff00] text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00]" />
              Alex
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-black/40 border border-[#b266ff]/30 text-[#b266ff] text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b266ff]" />
              Elena
            </span>
          </div>
        </div>
      </div>

      {/* ── Editor Code Canvas ────────────────────────────────────────────── */}
      <div className="p-3 sm:p-4 bg-[#111113] overflow-hidden text-xs sm:text-[13px] leading-6 min-h-[280px]">
        {activeTab === "pair_session.ts" ? (
          <div className="flex flex-col">
            {/* Header Lines 1-6 (Static) */}
            {STATIC_HEADER_LINES.map((lineTokens, idx) => (
              <div key={idx} className="flex items-center h-6">
                <span className="w-7 sm:w-8 text-right pr-3 sm:pr-4 text-[#52525b] select-none text-xs">
                  {idx + 1}
                </span>
                <div className="flex-1 font-mono whitespace-pre truncate">
                  {lineTokens.map((t, tIdx) => (
                    <span key={tIdx} className={t.cls}>
                      {t.text}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {/* Line 7 (Alex typing line 1) */}
            <div className="flex items-center h-6">
              <span className="w-7 sm:w-8 text-right pr-3 sm:pr-4 text-[#52525b] select-none text-xs">
                7
              </span>
              <div className="flex-1 font-mono whitespace-pre truncate">
                {isLine7Cursor && line7Budget === 0 ? (
                  <>
                    <span className="text-zinc-500">  </span>
                    <CursorElement color="#ccff00" name="Alex" />
                  </>
                ) : (
                  renderTokens(
                    ALEX_LINES[0],
                    line7Budget,
                    isLine7Cursor,
                    "#ccff00",
                    "Alex"
                  )
                )}
              </div>
            </div>

            {/* Line 8 (Alex typing line 2) */}
            <div className="flex items-center h-6">
              <span className="w-7 sm:w-8 text-right pr-3 sm:pr-4 text-[#52525b] select-none text-xs">
                8
              </span>
              <div className="flex-1 font-mono whitespace-pre truncate">
                {renderTokens(
                  ALEX_LINES[1],
                  line8Budget,
                  isLine8Cursor,
                  "#ccff00",
                  "Alex"
                )}
              </div>
            </div>

            {/* Line 9 (Alex typing line 3) */}
            <div className="flex items-center h-6">
              <span className="w-7 sm:w-8 text-right pr-3 sm:pr-4 text-[#52525b] select-none text-xs">
                9
              </span>
              <div className="flex-1 font-mono whitespace-pre truncate">
                {renderTokens(
                  ALEX_LINES[2],
                  line9Budget,
                  isLine9Cursor,
                  "#ccff00",
                  "Alex"
                )}
              </div>
            </div>

            {/* Line 10 (Elena typing line 1) */}
            <div className="flex items-center h-6">
              <span className="w-7 sm:w-8 text-right pr-3 sm:pr-4 text-[#52525b] select-none text-xs">
                10
              </span>
              <div className="flex-1 font-mono whitespace-pre truncate">
                {isLine10Cursor && line10Budget === 0 ? (
                  <>
                    <span className="text-zinc-500">  </span>
                    <CursorElement color="#b266ff" name="Elena" />
                  </>
                ) : (
                  renderTokens(
                    ELENA_LINES[0],
                    line10Budget,
                    isLine10Cursor,
                    "#b266ff",
                    "Elena"
                  )
                )}
              </div>
            </div>

            {/* Line 11 (Elena typing line 2) */}
            <div className="flex items-center h-6">
              <span className="w-7 sm:w-8 text-right pr-3 sm:pr-4 text-[#52525b] select-none text-xs">
                11
              </span>
              <div className="flex-1 font-mono whitespace-pre truncate">
                {renderTokens(
                  ELENA_LINES[1],
                  line11Budget,
                  isLine11Cursor,
                  "#b266ff",
                  "Elena"
                )}
              </div>
            </div>

            {/* Line 12 (Static Closing Bracket) */}
            <div className="flex items-center h-6">
              <span className="w-7 sm:w-8 text-right pr-3 sm:pr-4 text-[#52525b] select-none text-xs">
                12
              </span>
              <div className="flex-1 font-mono whitespace-pre truncate">
                {STATIC_FOOTER_LINE.map((t, tIdx) => (
                  <span key={tIdx} className={t.cls}>
                    {t.text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* types.ts Tab View */
          <div className="flex flex-col">
            {TYPES_TAB_LINES.map((lineTokens, idx) => (
              <div key={idx} className="flex items-center h-6">
                <span className="w-7 sm:w-8 text-right pr-3 sm:pr-4 text-[#52525b] select-none text-xs">
                  {idx + 1}
                </span>
                <div className="flex-1 font-mono whitespace-pre truncate">
                  {lineTokens.map((t, tIdx) => (
                    <span key={tIdx} className={t.cls}>
                      {t.text}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Integrated Bottom Terminal Pane ───────────────────────────────── */}
      <div className="h-28 sm:h-32 bg-[#09090b] border-t border-white/[0.08] px-4 py-2.5 flex flex-col font-mono text-[11px] sm:text-xs">
        {/* Terminal Header */}
        <div className="flex items-center justify-between text-[#52525b] text-[10px] uppercase tracking-wider mb-2 pb-1 border-b border-white/[0.04]">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Terminal className="w-3.5 h-3.5 text-[#ccff00]" />
            <span className="font-bold">TERMINAL • zsh</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#ccff00]">● CONNECTED</span>
            <span>18ms</span>
          </div>
        </div>

        {/* Terminal Output Stream */}
        <div className="flex flex-col gap-1 text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="text-[#ccff00] font-bold">⚡ [Sync]</span>
            <span>Peer connected: 18ms latency</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-emerald-400">✓</span>
            <span>WebRTC DataChannel established (p2p-mesh)</span>
          </div>

          {showTests ? (
            <div className="flex items-center gap-2 text-emerald-400 font-bold transition-all duration-300">
              <span className="text-emerald-400">✓</span>
              <span>Tests passing: 12/12</span>
              <span className="text-zinc-500 font-normal text-[10px] ml-1">(24ms)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-zinc-500">
              <span className="animate-spin inline-block">⠋</span>
              <span>Compiling AST delta...</span>
            </div>
          )}
        </div>
      </div>

      {/* Optional Injected Children */}
      {children}
    </div>
  );
}
