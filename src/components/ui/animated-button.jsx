import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Animated Button (Vengeance UI Component)
 * 
 * High-craft CTA button featuring an elegant continuous light sweep across the surface,
 * spring-physics hover response, and crisp typography.
 */
export const AnimatedButton = ({
  children,
  className,
  variant = "primary", // "primary" (solid white) | "dark" (sleek dark glass)
  whileTap = { scale: 0.98 },
  onClick,
  ...props
}) => {
  const isPrimary = variant === "primary";

  return (
    <motion.button
      whileTap={whileTap}
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-medium transition-all duration-300 cursor-pointer select-none",
        isPrimary
          ? "bg-white text-black hover:bg-neutral-100 px-7 py-3 text-sm sm:text-base shadow-[0_0_20px_rgba(255,255,255,0.15)]"
          : "bg-white/[0.06] hover:bg-white/[0.1] text-[#f0f0f0] border border-white/15 px-7 py-3 text-sm sm:text-base backdrop-blur-md",
        className
      )}
      {...props}
    >
      {/* Light sweep animation overlay */}
      <motion.div
        aria-hidden="true"
        initial={{ x: "-100%" }}
        animate={{ x: "200%" }}
        transition={{
          repeat: Infinity,
          duration: 3.5,
          ease: "easeInOut",
          repeatDelay: 2,
        }}
        className={cn(
          "pointer-events-none absolute inset-0 -skew-x-12",
          isPrimary
            ? "bg-gradient-to-r from-transparent via-black/10 to-transparent"
            : "bg-gradient-to-r from-transparent via-white/15 to-transparent"
        )}
      />

      <span className="relative z-10 flex items-center gap-2 font-medium tracking-tight">
        {children}
      </span>
    </motion.button>
  );
};

export default AnimatedButton;
