import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Radial Glow Button (Vengeance UI Component)
 * 
 * Features an interactive radial gradient glow that follows the cursor
 * and radiates crisp, high-craft illumination on hover.
 */
export const RadialGlowButton = ({
  children,
  className,
  glowColor = "rgba(255, 255, 255, 0.45)",
  borderColor = "rgba(255, 255, 255, 0.6)",
  bg = "bg-white",
  text = "text-black",
  rounded = "rounded-full",
  onClick,
  disabled = false,
  ...props
}) => {
  const buttonRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!buttonRef.current || disabled) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseEnter = () => {
    if (!disabled) setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 overflow-hidden px-7 py-3 text-sm sm:text-base font-semibold transition-all duration-300 select-none cursor-pointer",
        rounded,
        bg,
        text,
        "shadow-[0_4px_20px_rgba(0,0,0,0.4)] active:scale-[0.98]",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    >
      {/* Radial glow follower overlay */}
      <div
        className={cn("pointer-events-none absolute -inset-px transition-opacity duration-300", rounded)}
        style={{
          opacity,
          background: `radial-gradient(130px circle at ${position.x}px ${position.y}px, ${glowColor}, transparent 75%)`,
        }}
      />
      {/* Glowing border ring */}
      <div
        className={cn("pointer-events-none absolute inset-0 transition-opacity duration-300", rounded)}
        style={{
          opacity,
          boxShadow: `0 0 20px ${glowColor}, inset 0 0 8px ${borderColor}`,
          border: `1px solid ${borderColor}`,
        }}
      />
      <span className="relative z-10 flex items-center gap-2 font-semibold tracking-tight">
        {children}
      </span>
    </button>
  );
};

export default RadialGlowButton;
