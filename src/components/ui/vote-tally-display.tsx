import { VoteTally } from "@/hooks/useVoteTallies";
import clsx from "clsx";

interface VoteTallyDisplayProps {
  tally?: VoteTally;
  className?: string;
  size?: "sm" | "md";
}

export const VoteTallyDisplay = ({
  tally,
  className = "",
  size = "sm",
}: VoteTallyDisplayProps) => {
  const sizeClasses = {
    sm: "text-xs gap-2",
    md: "text-sm gap-3",
  };

  // Use fallback values when tally is not available
  const displayTally = tally || {
    alias: "",
    upvotes: 0,
    downvotes: 0,
    totalVotes: 0,
  };

  const isLoading = !tally;

  return (
    <div
      className={`flex items-center ${sizeClasses[size]} ${className} ${isLoading ? "opacity-50" : ""}`}
    >
      {/* Upvotes */}
      <div
        className={clsx(
          "flex items-center gap-1 text-primary",
          displayTally.upvotes === 0 && "opacity-50",
        )}
      >
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 15l7-7 7 7"
          />
        </svg>
        <span className="font-medium">{displayTally.upvotes}</span>
      </div>

      {/* Downvotes */}
      <div
        className={clsx(
          "flex items-center gap-1 text-red-500",
          displayTally.downvotes === 0 && "opacity-50",
        )}
      >
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
        <span className="font-medium">{displayTally.downvotes}</span>
      </div>
    </div>
  );
};
