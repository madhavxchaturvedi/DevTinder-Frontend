import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Corner Button (Vengeance UI Component)
 * 
 * Features sleek minimalist corner tick accents, clean dark glass backdrop,
 * and high-craft typography.
 */
export const CornerButton = ({
  children = "Start Designing",
  className,
  icon,
  showIcon = true,
  accentColor = "#ccff00",
  onClick,
  ...props
}) => {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 px-7 py-3 rounded-lg bg-[#111113]/90 text-[#f0f0f0] border border-white/10 font-medium text-sm sm:text-base backdrop-blur-md hover:border-white/20 transition-all duration-300 group cursor-pointer",
        className
      )}
      {...props}
    >
      {/* 4 Corner Accents */}
      <span
        className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 rounded-tl-sm transition-colors duration-300 group-hover:scale-110"
        style={{ borderColor: accentColor }}
      />
      <span
        className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 rounded-tr-sm transition-colors duration-300 group-hover:scale-110"
        style={{ borderColor: accentColor }}
      />
      <span
        className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 rounded-bl-sm transition-colors duration-300 group-hover:scale-110"
        style={{ borderColor: accentColor }}
      />
      <span
        className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 rounded-br-sm transition-colors duration-300 group-hover:scale-110"
        style={{ borderColor: accentColor }}
      />

      <span className="relative z-10 flex items-center gap-2 tracking-tight">
        {children}
        {showIcon && (icon || <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />)}
      </span>
    </motion.button>
  );
};

export default CornerButton;
