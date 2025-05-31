"use client";
import { ScoredBusiness } from "@/lib/coffee-shop-scoring";
import clsx from "clsx";

interface ScoringDisplayProps {
  business: ScoredBusiness;
  showBreakdown?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const ScoringDisplay = ({
  business,
  showBreakdown = false,
  size = "sm",
  className,
}: ScoringDisplayProps) => {
  const { totalScore, voteScore, qualityScore, distanceScore, categoryBonus } =
    business;

  const sizeClasses = {
    sm: {
      total: "text-sm font-semibold",
      breakdown: "text-xs",
      badge: "px-2 py-1",
    },
    md: {
      total: "text-base font-semibold",
      breakdown: "text-sm",
      badge: "px-3 py-1.5",
    },
    lg: {
      total: "text-lg font-semibold",
      breakdown: "text-base",
      badge: "px-4 py-2",
    },
  };

  const currentSize = sizeClasses[size];

  // Color coding based on score ranges
  const getScoreColor = (score: number) => {
    if (score >= 1500)
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (score >= 1000) return "bg-blue-100 text-blue-800 border-blue-200";
    if (score >= 500) return "bg-amber-100 text-amber-800 border-amber-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <div className={clsx("space-y-2", className)}>
      {/* Total Score Badge */}
      <div
        className={clsx(
          "inline-flex items-center border rounded-md",
          currentSize.badge,
          currentSize.total,
          getScoreColor(totalScore),
        )}
      >
        <span className="text-xs mr-1">Score:</span>
        <span>{Math.round(totalScore)}</span>
      </div>

      {/* Breakdown */}
      {showBreakdown && (
        <div className={clsx("space-y-1", currentSize.breakdown)}>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Votes:</span>
              <span
                className={clsx(
                  "font-medium",
                  voteScore > 0
                    ? "text-green-600"
                    : voteScore < 0
                      ? "text-red-600"
                      : "text-gray-500",
                )}
              >
                {voteScore > 0
                  ? `+${Math.round(voteScore * 200)}`
                  : voteScore < 0
                    ? Math.round(voteScore * 200)
                    : "0"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Quality:</span>
              <span className="font-medium text-blue-600">
                +{Math.round(qualityScore * 20)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Distance:</span>
              <span className="font-medium text-purple-600">
                +{Math.round(distanceScore * 30)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Category:</span>
              <span
                className={clsx(
                  "font-medium",
                  categoryBonus > 0
                    ? "text-emerald-600"
                    : categoryBonus < 0
                      ? "text-red-600"
                      : "text-gray-500",
                )}
              >
                {categoryBonus > 0
                  ? `+${categoryBonus}`
                  : categoryBonus < 0
                    ? categoryBonus
                    : "0"}
              </span>
            </div>
          </div>

          {/* Score Formula Explanation */}
          <div className="text-xs text-gray-500 pt-1 border-t">
            Total = (Votes×200) + (Quality×20) + (Distance×30) + Category
          </div>
        </div>
      )}
    </div>
  );
};
