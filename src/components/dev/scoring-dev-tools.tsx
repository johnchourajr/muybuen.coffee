"use client";
import { motion } from "motion/react";

interface ScoringDevToolsProps {
  showScoringBreakdown: boolean;
  setShowScoringBreakdown: (show: boolean) => void;
  hasResults: boolean;
  className?: string;
}

export const ScoringDevTools = ({
  showScoringBreakdown,
  setShowScoringBreakdown,
  hasResults,
  className,
}: ScoringDevToolsProps) => {
  // Don't render anything if not in development
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  if (!hasResults) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: "1rem" }}
      animate={{ opacity: 1, y: "0rem" }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={`grid-container ${className || ""}`}
    >
      <div className="col-span-full pt-10 pb-6 relative z-20">
        <div className="bg-primary/5 border border-primary/25 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-primary">
              Dev Tools - Scoring
            </h3>
          </div>

          <button
            onClick={() => setShowScoringBreakdown(!showScoringBreakdown)}
            className="text-sm bg-primary/10 hover:bg-primary/20 px-3 py-2 rounded-md transition-colors"
          >
            {showScoringBreakdown ? "Hide" : "Show"} Scoring Details
          </button>
        </div>
      </div>
    </motion.div>
  );
};
