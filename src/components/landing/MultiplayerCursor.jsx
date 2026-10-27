import React, { useState, useEffect, useCallback, useRef } from "react";

/**
 * Custom SVG Cursor Pointer with "You (Guest)" multiplayer badge.
 * Designed strictly for interactive code editor and demo session tiles.
 * Active ONLY on hover over designated containers (#hero-mock-editor, #session-tile-*).
 */
export function MultiplayerCursor({
  position = { x: 0, y: 0 },
  visible = false,
  label = "You (Guest)",
  color = "#ccff00",
}) {
  if (!visible) return null;

  return (
    <div
      className="absolute top-0 left-0 pointer-events-none select-none z-50 transition-transform duration-75 ease-out will-change-transform"
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
      }}
      aria-hidden="true"
    >
      {/* Sleek Custom SVG Cursor Arrow */}
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_2px_8px_rgba(204,255,0,0.45)]"
      >
        <path
          d="M3.5 2.5L19.5 12.5L11.5 14L8.5 21.5L3.5 2.5Z"
          fill={color}
          stroke="#000000"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>

      {/* Floating Badge Pill with Exact Text "You (Guest)" */}
      <div
        className="absolute left-3 top-3.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider text-black shadow-[0_2px_10px_rgba(0,0,0,0.6)] whitespace-nowrap flex items-center gap-1 select-none"
        style={{
          backgroundColor: color,
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-black/60 animate-pulse" />
        <span>{label}</span>
      </div>
    </div>
  );
}

/**
 * Hook to manage multiplayer cursor tracking within designated interactive containers:
 * - #hero-mock-editor
 * - #session-tile-debug
 * - #session-tile-sprint
 */
export function useMultiplayerCursor(containerRef, options = {}) {
  const {
    label = "You (Guest)",
    color = "#ccff00",
    disabled = false,
  } = options;

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);

  // Guard against touch devices during client hydration
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      const media = window.matchMedia("(pointer: coarse)");
      setIsCoarsePointer(media.matches);

      const listener = (e) => setIsCoarsePointer(e.matches);
      if (media.addEventListener) {
        media.addEventListener("change", listener);
        return () => media.removeEventListener("change", listener);
      }
    }
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current || isCoarsePointer || disabled) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    setPosition({ x, y });
  }, [containerRef, isCoarsePointer, disabled]);

  const handleMouseEnter = useCallback((e) => {
    if (isCoarsePointer || disabled) return;
    setIsHovered(true);
    handleMouseMove(e);
  }, [isCoarsePointer, disabled, handleMouseMove]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return {
    isHovered: isHovered && !isCoarsePointer && !disabled,
    position,
    containerProps: {
      onMouseEnter: handleMouseEnter,
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
      className: isHovered && !isCoarsePointer && !disabled ? "cursor-none" : "",
    },
    cursorProps: {
      position,
      visible: isHovered && !isCoarsePointer && !disabled,
      label,
      color,
    },
  };
}

/**
 * Drop-in container boundary wrapper for designated multiplayer tiles:
 * (#hero-mock-editor, #session-tile-debug, #session-tile-sprint).
 */
export function MultiplayerCursorBoundary({
  id,
  children,
  className = "",
  label = "You (Guest)",
  color = "#ccff00",
  ...rest
}) {
  const containerRef = useRef(null);
  const { cursorProps, containerProps } = useMultiplayerCursor(containerRef, {
    label,
    color,
  });

  return (
    <div
      ref={containerRef}
      id={id}
      {...containerProps}
      {...rest}
      className={`relative overflow-hidden ${containerProps.className} ${className}`}
    >
      <MultiplayerCursor {...cursorProps} />
      {children}
    </div>
  );
}

export default MultiplayerCursor;
