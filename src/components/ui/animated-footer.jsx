"use client";

import * as React from "react";
import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

/**
 * Animated Footer
 *
 * A cinematic, reveal-on-scroll footer: two source images are re-drawn as
 * live ASCII art on <canvas>, light up in little clusters around the cursor,
 * and drift with a soft parallax. When the footer scrolls into view the
 * display headings unmask character-by-character, the links and copy slide
 * up behind masks, and the ASCII "hands" glide in from the edges.
 *
 * Ported from Vengeance UI into a single, self-contained React component.
 */

const DEFAULT_ASCII_CHARS = "........:::=+xX#0369";

const HIGHLIGHT_LIFETIME = 300; // ms a hovered cell stays lit
const CLUSTER_SIZE = 10; // max cells a hover ripple spreads across
const PARALLAX_EASE = 0.05;

/** Build the ASCII cell grid for one image by sampling its brightness. */
function buildHandCells(image, columns, asciiChars) {
  const rows = Math.max(
    1,
    Math.round(columns / (image.naturalWidth / image.naturalHeight || 1))
  );

  const sampler = document.createElement("canvas");
  sampler.width = columns;
  sampler.height = rows;
  const sampleCtx = sampler.getContext("2d");
  const cells = new Map();
  if (!sampleCtx) return { rows, cells };

  sampleCtx.drawImage(image, 0, 0, columns, rows);
  const pixels = sampleCtx.getImageData(0, 0, columns, rows).data;
  const backgroundCharIndex = asciiChars.lastIndexOf(".");

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const offset = (row * columns + col) * 4;
      const brightness =
        (pixels[offset] * 0.299 +
          pixels[offset + 1] * 0.587 +
          pixels[offset + 2] * 0.114) /
        255;
      const charIndex = Math.min(
        asciiChars.length - 1,
        Math.floor((1 - brightness) * asciiChars.length)
      );
      if (charIndex <= backgroundCharIndex) continue;

      cells.set(`${col},${row}`, {
        col,
        row,
        char: asciiChars[charIndex],
        highlightEndTime: 0,
      });
    }
  }

  return { rows, cells };
}

/** Light up a wandering cluster of cells starting from `startCell`. */
function highlightCluster(cells, startCell) {
  const now = Date.now();
  startCell.highlightEndTime = now + HIGHLIGHT_LIFETIME;

  const steps = Math.floor(Math.random() * CLUSTER_SIZE) + 1;
  const litCells = [startCell];
  let current = startCell;

  for (let step = 0; step < steps; step++) {
    const neighbours = [];
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const neighbour = cells.get(`${current.col + dx},${current.row + dy}`);
        if (neighbour && !litCells.includes(neighbour)) neighbours.push(neighbour);
      }
    }
    if (neighbours.length === 0) break;

    const next = neighbours[Math.floor(Math.random() * neighbours.length)];
    next.highlightEndTime = now + HIGHLIGHT_LIFETIME + step * 10;
    litCells.push(next);
    current = next;
  }
}

/** Nearest scrollable ancestor — used as the reveal's IntersectionObserver root. */
function getScrollParent(node) {
  let el = node?.parentElement ?? null;
  while (el) {
    const overflowY = getComputedStyle(el).overflowY;
    if (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") return el;
    el = el.parentElement;
  }
  return null;
}

export function AnimatedFooter({
  headingLines = ["OctoPair"],
  leftImage = "/animated-footer/hand-left.jpg",
  rightImage = "/animated-footer/hand-right.jpg",
  background = "#09090b",
  textColor = "#ffffff",
  charColor,
  leftCharColor,
  rightCharColor,
  hoverColor,
  leftHoverColor = "#ccff00",
  rightHoverColor = "#b266ff",
  hoverCharColor = "#09090b",
  titleClassName = "bg-gradient-to-b from-white/25 via-white/10 to-white/[0.02] bg-clip-text text-transparent",
  asciiChars = DEFAULT_ASCII_CHARS,
  columns = 80,
  cellSize = 20,
  fontSize = 18,
  parallaxStrength = 20,
  hoverRadius = 8,
  revealOnScroll = true,
  revealed,
  className,
  children,
  bottomContent,
}) {
  const rootRef = useRef(null);
  const leftWrapRef = useRef(null);
  const rightWrapRef = useRef(null);
  const leftCanvasRef = useRef(null);
  const rightCanvasRef = useRef(null);
  const headingWrapRef = useRef(null);
  const handsRef = useRef([]);

  // Reveal animations, published by the main effect so the controlled-`revealed`
  // effect below can play them without rebuilding the ASCII scene.
  const animateInRef = useRef(() => {});
  const animateOutRef = useRef(() => {});

  const { resolvedTheme } = useTheme?.() || { resolvedTheme: "dark" };
  const isDark = resolvedTheme !== "light";

  const cc = charColor ?? (isDark ? "#3f3f46" : "#71717a");
  const lcc = leftCharColor ?? cc;
  const rcc = rightCharColor ?? cc;
  const hc = hoverColor ?? "#ccff00";
  const lhc = leftHoverColor ?? hc;
  const rhc = rightHoverColor ?? "#b266ff";
  const hcc = hoverCharColor ?? "#09090b";

  // Live-tunable values read inside the animation loop, so tweaking a color or
  // the parallax strength never tears down and rebuilds the ASCII scene.
  const liveRef = useRef({
    charColor: cc,
    leftCharColor: lcc,
    rightCharColor: rcc,
    hoverColor: hc,
    leftHoverColor: lhc,
    rightHoverColor: rhc,
    hoverCharColor: hcc,
    parallaxStrength,
    hoverRadius,
  });
  useEffect(() => {
    liveRef.current = {
      charColor: cc,
      leftCharColor: lcc,
      rightCharColor: rcc,
      hoverColor: hc,
      leftHoverColor: lhc,
      rightHoverColor: rhc,
      hoverCharColor: hcc,
      parallaxStrength,
      hoverRadius,
    };
    // Immediately mark active hands dirty so color changes redraw on next frame
    if (handsRef.current) {
      for (const h of handsRef.current) {
        h.dirty = true;
      }
    }
  }, [cc, lcc, rcc, hc, lhc, rhc, hcc, parallaxStrength, hoverRadius]);

  // A signature of the structural inputs — the scene rebuilds only when one of
  // these changes (images, grid resolution, content, reveal mode).
  const sig = useMemo(
    () =>
      JSON.stringify({
        leftImage,
        rightImage,
        columns,
        cellSize,
        fontSize,
        asciiChars,
        revealOnScroll,
        headingLines,
      }),
    [leftImage, rightImage, columns, cellSize, fontSize, asciiChars, revealOnScroll, headingLines],
  );

  useEffect(() => {
    const root = rootRef.current;
    const leftWrap = leftWrapRef.current;
    const rightWrap = rightWrapRef.current;
    if (!root || !leftWrap || !rightWrap) return;

    const hands = [];
    handsRef.current = hands;
    const wrappers = [leftWrap, rightWrap];

    // ── ASCII hands ──────────────────────────────────────────────────────
    const setupHand = (image, canvas, direction, side) => {
      const { rows, cells } = buildHandCells(image, columns, asciiChars);
      if (cells.size === 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = columns * cellSize * dpr;
      canvas.height = rows * cellSize * dpr;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";

      const metrics = ctx.measureText("X");
      const glyphHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
      const baselineOffset = cellSize / 2 + glyphHeight / 2 - metrics.actualBoundingBoxDescent;

      hands.push({
        canvas,
        ctx,
        cells,
        cellList: [...cells.values()],
        rows,
        columns,
        cellSize,
        baselineOffset,
        direction,
        side,
        dirty: true,
        lastActiveHighlights: 0,
      });
    };

    const loadHand = (src, canvas, direction, side) => {
      if (!src || !canvas) return;
      const image = new Image();
      image.crossOrigin = "anonymous";
      let initialized = false;
      const init = () => {
        if (initialized) return;
        initialized = true;
        setupHand(image, canvas, direction, side);
      };
      image.onload = init;
      image.src = src;
      if (image.complete && image.naturalWidth) init();
    };
    if (leftCanvasRef.current) loadHand(leftImage, leftCanvasRef.current, 1, "left");
    if (rightCanvasRef.current) loadHand(rightImage, rightCanvasRef.current, -1, "right");

    const renderHand = (hand, now) => {
      const { ctx, cellList, cellSize: cs, baselineOffset, columns: cols, rows, side } = hand;
      const isLeft = side === "left";
      const live = liveRef.current;
      const handCharColor = isLeft
        ? (live.leftCharColor || live.charColor || cc)
        : (live.rightCharColor || live.charColor || cc);
      const handHoverColor = isLeft
        ? (live.leftHoverColor || live.hoverColor || "#ccff00")
        : (live.rightHoverColor || live.hoverColor || "#b266ff");
      const hcc = live.hoverCharColor || "#09090b";

      let activeHighlights = 0;
      for (let i = 0; i < cellList.length; i++) {
        if (cellList[i].highlightEndTime > now) activeHighlights++;
      }

      if (!hand.dirty && activeHighlights === 0 && hand.lastActiveHighlights === 0) {
        return;
      }
      hand.dirty = false;
      hand.lastActiveHighlights = activeHighlights;

      ctx.clearRect(0, 0, cols * cs, rows * cs);

      for (const cell of cellList) {
        const x = cell.col * cs;
        const y = cell.row * cs;
        const isHighlighted = cell.highlightEndTime > now;

        if (isHighlighted) {
          ctx.fillStyle = handHoverColor;
          ctx.fillRect(x, y, cs, cs);
        }
        ctx.fillStyle = isHighlighted ? hcc : handCharColor;
        ctx.fillText(cell.char, x + cs / 2, y + baselineOffset);
      }
    };

    // ── Pointer: hover highlight + parallax target ───────────────────────
    const pointer = { x: 0, y: 0 };
    const drift = { x: 0, y: 0 };
    // Reveal "curtain": hands start pushed off the edges and slide to 0.
    const curtain = { offset: revealOnScroll ? 125 : 0 };

    const hoverHand = (hand, clientX, clientY) => {
      const rect = hand.canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      // Strict bounding check: cursor must be near the canvas itself
      if (
        clientX < rect.left - 10 ||
        clientX > rect.right + 10 ||
        clientY < rect.top - 10 ||
        clientY > rect.bottom + 10
      ) {
        return;
      }

      const mouseCol = ((clientX - rect.left) / rect.width) * hand.columns;
      const mouseRow = ((clientY - rect.top) / rect.height) * hand.rows;

      const hr = liveRef.current.hoverRadius;
      if (
        mouseCol < -hr ||
        mouseCol > hand.columns + hr ||
        mouseRow < -hr ||
        mouseRow > hand.rows + hr
      ) {
        return;
      }

      const hrSq = hr * hr;
      let closest = null;
      let closestDistSq = hrSq;

      const minCol = Math.max(0, Math.floor(mouseCol - hr));
      const maxCol = Math.min(hand.columns - 1, Math.ceil(mouseCol + hr));
      const minRow = Math.max(0, Math.floor(mouseRow - hr));
      const maxRow = Math.min(hand.rows - 1, Math.ceil(mouseRow + hr));

      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          const cell = hand.cells.get(`${c},${r}`);
          if (!cell) continue;
          const dx = mouseCol - c;
          const dy = mouseRow - r;
          const dSq = dx * dx + dy * dy;
          if (dSq < closestDistSq) {
            closestDistSq = dSq;
            closest = cell;
          }
        }
      }

      if (closest) {
        highlightCluster(hand.cells, closest);
        hand.dirty = true;
      }
    };

    const onMouseMove = (event) => {
      const strength = liveRef.current.parallaxStrength;
      const rect = root.getBoundingClientRect();
      const w = rect.width || 1;
      const h = rect.height || 1;
      // Clamp normalized coordinates strictly within [0, 1] to prevent runaway drift
      const normX = Math.max(0, Math.min(1, (event.clientX - rect.left) / w));
      const normY = Math.max(0, Math.min(1, (event.clientY - rect.top) / h));
      pointer.x = (normX - 0.5) * strength * 2;
      pointer.y = (normY - 0.5) * strength * 2;

      // If cursor is within navigation links or interactive controls, skip hand hover highlighting
      const navEl = root.querySelector("[data-footer-nav]");
      if (navEl) {
        const nr = navEl.getBoundingClientRect();
        if (
          event.clientY >= nr.top - 10 &&
          event.clientY <= nr.bottom + 10 &&
          event.clientX >= nr.left - 10 &&
          event.clientX <= nr.right + 10
        ) {
          return;
        }
      }

      for (const hand of hands) hoverHand(hand, event.clientX, event.clientY);
    };

    const onMouseLeave = () => {
      // Gently return to resting center equilibrium when cursor departs
      pointer.x = 0;
      pointer.y = 0;
    };

    const onTouchMove = (event) => {
      if (!event.touches || event.touches.length === 0) return;
      const touch = event.touches[0];
      onMouseMove(touch);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    root.addEventListener("mouseleave", onMouseLeave);
    const onWindowOut = (e) => {
      if (!e.relatedTarget && !e.toElement) onMouseLeave();
    };
    window.addEventListener("mouseout", onWindowOut);

    // ── Unified render loop: ASCII + parallax + reveal curtain ───────────
    let rafId = 0;
    let lastTime = 0;
    const safeRaf = typeof window !== "undefined" && window.requestAnimationFrame ? window.requestAnimationFrame : (cb) => setTimeout(cb, 16);
    const safeCaf = typeof window !== "undefined" && window.cancelAnimationFrame ? window.cancelAnimationFrame : clearTimeout;
    const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const frame = () => {
      const now = Date.now();
      for (const hand of hands) renderHand(hand, now);

      if (!prefersReducedMotion) {
        const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.1) : 1 / 60;
        lastTime = now;
        const ease = 1 - Math.pow(1 - PARALLAX_EASE, dt * 60);

        drift.x += (pointer.x - drift.x) * ease;
        drift.y += (pointer.y - drift.y) * ease;
      } else {
        drift.x = 0;
        drift.y = 0;
      }

      const strength = liveRef.current.parallaxStrength;
      const rect = root.getBoundingClientRect();
      const isNarrow = (rect.width || 1) < 640;
      // Tighten scale multiplier to prevent hands occupying >90% container width on mobile
      const scale = isNarrow ? 1.05 : 1 + (strength * 2) / 300;

      wrappers.forEach((wrapper, i) => {
        const dir = i === 0 ? 1 : -1;
        const revealX = i === 0 ? -curtain.offset : curtain.offset;
        const x = (isNarrow ? drift.x * 0.4 : drift.x) * dir || 0;
        const y = -drift.y || 0;
        wrapper.style.transformOrigin = i === 0 ? "left center" : "right center";
        // Apply reveal via translateX, then apply parallax via translate, avoiding calc() mixed-unit bugs
        wrapper.style.transform = `translateX(${revealX}%) translate(${x}px, ${y}px) scale(${scale})`;
      });

      // Antigravity-inspired kinetic parallax drift for the product title
      if (headingWrapRef.current) {
        if (!prefersReducedMotion) {
          const floatY = Math.sin(now * 0.0015) * 2;
          const titleX = -drift.x * 0.35;
          const titleY = -drift.y * 0.25 + floatY;
          headingWrapRef.current.style.transform = `translate(${titleX}px, ${titleY}px)`;
        } else {
          headingWrapRef.current.style.transform = "none";
        }
      }

      rafId = safeRaf(frame);
    };
    rafId = safeRaf(frame);

    // ── Reveal (chars + curtain) ─────────────────────────
    const chars = gsap.utils.toArray(root.querySelectorAll("[data-af-char]"));

    const animateIn = () => {
      if (prefersReducedMotion) {
        curtain.offset = 0;
        gsap.set(chars, { yPercent: 0 });
        return;
      }
      gsap.to(curtain, { offset: 0, duration: 1, ease: "power3.out", overwrite: true });
      gsap.to(chars, {
        yPercent: 0,
        duration: 1,
        ease: "power3.out",
        stagger: { each: 0.04, from: "center" },
        overwrite: true,
      });
    };

    const animateOut = () => {
      if (prefersReducedMotion) {
        curtain.offset = 125;
        gsap.set(chars, { yPercent: 125 });
        return;
      }
      gsap.to(curtain, { offset: 125, duration: 0.4, ease: "power2.in", overwrite: true });
      gsap.to(chars, {
        yPercent: 125,
        duration: 0.4,
        ease: "power2.in",
        stagger: { each: 0.01, from: "center" },
        overwrite: true,
      });
    };

    // Publish for the controlled-`revealed` effect.
    animateInRef.current = animateIn;
    animateOutRef.current = animateOut;

    const maskAll = () => {
      if (prefersReducedMotion) {
        curtain.offset = 0;
        gsap.set(chars, { yPercent: 0 });
        return;
      }
      gsap.set(chars, { yPercent: 125 });
    };
    const showAll = () => {
      gsap.set(chars, { yPercent: 0 });
    };

    let observer = null;

    if (prefersReducedMotion) {
      curtain.offset = 0;
      showAll();
    } else if (revealed !== undefined) {
      curtain.offset = revealed ? 0 : 125;
      if (revealed) showAll();
      else maskAll();
    } else if (revealOnScroll && typeof IntersectionObserver !== "undefined") {
      maskAll();

      const scrollParent = getScrollParent(root);
      const obsRoot =
        scrollParent &&
        scrollParent !== document.documentElement &&
        scrollParent !== document.body
          ? scrollParent
          : null;

      let isRevealed = false;
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting && !isRevealed) {
              isRevealed = true;
              animateIn();
            } else if (!entry.isIntersecting && isRevealed) {
              isRevealed = false;
              animateOut();
            }
          }
        },
        { root: obsRoot, threshold: [0.01, 0.08] },
      );
      observer.observe(root);

      // Fast check if already visible on mount
      if (typeof window !== "undefined") {
        const rect = root.getBoundingClientRect();
        if (rect.top < (window.innerHeight || 800) && rect.bottom > 0) {
          isRevealed = true;
          animateIn();
        }
      }
    } else {
      showAll();
    }

    // High-DPI screen change listener (e.g. moving window between 1x and 2x retina display)
    const updateDpr = () => {
      if (typeof window === "undefined") return;
      for (const hand of hands) {
        hand.dirty = true;
      }
    };
    let dprMatcher = null;
    if (typeof window !== "undefined" && window.matchMedia) {
      dprMatcher = window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
      try {
        dprMatcher.addEventListener("change", updateDpr);
      } catch {
        dprMatcher.addListener?.(updateDpr);
      }
    }

    // ── Cleanup ──────────────────────────────────────────────────────────
    return () => {
      safeCaf(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      root.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("mouseout", onWindowOut);
      if (dprMatcher) {
        try {
          dprMatcher.removeEventListener("change", updateDpr);
        } catch {
          dprMatcher.removeListener?.(updateDpr);
        }
      }
      observer?.disconnect();
      gsap.killTweensOf([curtain, ...chars]);
    };
  }, [sig]);

  useEffect(() => {
    if (revealed === undefined) return;
    if (revealed) animateInRef.current();
    else animateOutRef.current();
  }, [revealed]);

  const startsHidden = revealed !== undefined ? !revealed : revealOnScroll;
  const offEdge = startsHidden ? 125 : 0;

  return (
    <footer
      ref={rootRef}
      className={cn(
        "relative w-full overflow-hidden isolate",
        !background && "bg-white dark:bg-black",
        !textColor && "text-black dark:text-white",
        className
      )}
      style={{ backgroundColor: background, color: textColor, containerType: "inline-size" }}
    >
      {/* ASCII hands — positioned in the lower display area around the title, strictly below navigation links */}
      <div className="pointer-events-none absolute inset-x-0 bottom-16 sm:bottom-20 md:bottom-24 h-[280px] sm:h-[360px] md:h-[420px] flex items-center justify-between z-0">
        <div
          ref={leftWrapRef}
          className="relative w-[36%] max-w-[395px] min-w-[140px] sm:min-w-[180px] md:min-w-[210px] will-change-transform"
          style={{ transform: `translateX(-${offEdge}%)`, transformOrigin: "left center" }}
        >
          <canvas ref={leftCanvasRef} className="block h-auto w-full opacity-80" />
        </div>
        <div
          ref={rightWrapRef}
          className="relative w-[48%] max-w-[530px] min-w-[190px] sm:min-w-[240px] md:min-w-[280px] will-change-transform"
          style={{ transform: `translateX(${offEdge}%)`, transformOrigin: "right center" }}
        >
          <canvas ref={rightCanvasRef} className="block h-auto w-full opacity-80" />
        </div>
      </div>

      {/* Children content (Navigation, Brand links, Socials) */}
      {children && (
        <div className="relative z-20 w-full pointer-events-auto">
          {children}
        </div>
      )}

      {/* Display headings along the bottom edge / Antigravity kinetic product title */}
      <div
        ref={headingWrapRef}
        className="relative z-10 w-full flex items-end justify-center px-4 pt-10 pb-6 sm:pb-8 pointer-events-none select-none will-change-transform"
      >
        {headingLines.map((word, wi) => (
          <h2
            key={`${word}-${wi}`}
            aria-label={word}
            className="flex items-end justify-center leading-none tracking-[-0.03em] pt-8 pb-2 transition-opacity duration-300"
          >
            {Array.from(word).map((ch, ci) => (
              <span
                key={ci}
                data-af-char
                aria-hidden="true"
                className={cn(
                  "inline-block font-sans font-medium md:font-semibold tracking-[-0.03em] leading-none will-change-transform text-white",
                  titleClassName
                )}
                style={{ fontSize: "clamp(3.5rem, 15cqw, 11.5rem)" }}
              >
                {ch === " " ? "\u00A0" : ch}
              </span>
            ))}
          </h2>
        ))}
      </div>

      {/* Bottom content slot (copyright notice, subtitle) isolated at z-20 */}
      {bottomContent && (
        <div
          className="relative z-20 w-full"
          style={{ backgroundColor: background || "#09090b" }}
        >
          {bottomContent}
        </div>
      )}
    </footer>
  );
}

export default AnimatedFooter;
