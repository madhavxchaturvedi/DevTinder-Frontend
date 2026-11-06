import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Liquid Metal Button (Vengeance UI Component)
 * 
 * Features an animated fluid mercury/metallic shader canvas along the border
 * and background, delivering futuristic chrome reflections.
 */
export const LiquidMetalButton = ({
  children,
  icon,
  size = "md",
  borderWidth = 3,
  metalConfig = {
    colorBack: "#18181b",
    colorTint: "#e4e4e7",
    speed: 0.02,
  },
  className,
  onClick,
  disabled = false,
  ...props
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let time = 0;
    let dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      dpr = window.devicePixelRatio || 1;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const render = () => {
      time += metalConfig.speed || 0.02;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      ctx.clearRect(0, 0, w, h);

      // Create flowing metallic liquid gradient
      const grad = ctx.createLinearGradient(
        0,
        0,
        w * Math.cos(time * 0.7),
        h * Math.sin(time * 0.9)
      );

      const p1 = (Math.sin(time) + 1) / 2;
      const p2 = (Math.cos(time * 1.3) + 1) / 2;

      grad.addColorStop(0, metalConfig.colorBack || "#18181b");
      grad.addColorStop(Math.min(Math.max(p1 * 0.4 + 0.1, 0), 1), metalConfig.colorTint || "#e4e4e7");
      grad.addColorStop(Math.min(Math.max(p2 * 0.5 + 0.4, 0), 1), "#71717a");
      grad.addColorStop(1, metalConfig.colorBack || "#18181b");

      // Draw metallic liquid border ribbon
      ctx.lineWidth = borderWidth;
      ctx.strokeStyle = grad;

      // Rounded rect path
      const r = h / 2;
      ctx.beginPath();
      ctx.roundRect(borderWidth / 2, borderWidth / 2, w - borderWidth, h - borderWidth, r);
      ctx.stroke();

      // Soft metallic inner fluid reflection
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.globalAlpha = 1;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [borderWidth, metalConfig]);

  const sizeClasses = {
    sm: "px-5 py-2 text-xs",
    md: "px-7 py-3 text-sm sm:text-base",
    lg: "px-8 py-3.5 text-base sm:text-lg",
  }[size] || "px-7 py-3 text-sm sm:text-base";

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      whileHover={{ scale: disabled ? 1 : 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-medium transition-colors cursor-pointer select-none",
        "bg-[#111113]/90 text-neutral-200 hover:text-white backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.6)]",
        sizeClasses,
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    >
      {/* Liquid Metal canvas effect layer */}
      <div className="absolute inset-0 pointer-events-none rounded-full overflow-hidden">
        <canvas ref={canvasRef} className="block w-full h-full" />
      </div>

      <span className="relative z-10 flex items-center gap-2 tracking-tight">
        {children}
        {icon && <span className="transition-transform group-hover:translate-x-0.5">{icon}</span>}
      </span>
    </motion.button>
  );
};

export default LiquidMetalButton;
