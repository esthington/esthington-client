"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedCardProps extends HTMLAttributes<HTMLDivElement> {
  hoverEffect?: "lift" | "glow" | "border" | "none";
}

const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, hoverEffect = "lift", ...props }, ref) => {
    return (
      <div
        className={cn(
          "rounded-lg bg-white dark:bg-[#0F0F12] border border-gray-200 dark:border-[#1F1F23] overflow-hidden transition-all duration-300",
          hoverEffect === "glow" &&
            "hover:shadow-lg hover:shadow-blue-500/20 dark:hover:shadow-blue-500/10",
          hoverEffect === "border" &&
            "hover:border-blue-500 dark:hover:border-blue-400",
          className
        )}
        {...props}
      >
        {props.children}
      </div>
    );
  }
);

AnimatedCard.displayName = "AnimatedCard";

export { AnimatedCard };
