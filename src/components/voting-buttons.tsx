"use client";
import { useEffect, useState } from "react";
import { useUserVoting } from "../hooks/useUserVoting";

interface VotingButtonsProps {
  alias: string;
  className?: string;
}

interface VoteButtonProps {
  type: "upvote" | "downvote";
  count: number;
  isActive: boolean;
  isLoading: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

// Loading spinner component
const LoadingSpinner = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// Vote button component
const VoteButton = ({
  type,
  count,
  isActive,
  isLoading,
  isDisabled,
  onClick,
}: VoteButtonProps) => {
  const isUpvote = type === "upvote";

  const baseClasses =
    "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200";
  const disabledClasses = "opacity-75 cursor-not-allowed";

  const upvoteClasses = isActive
    ? "bg-primary text-white border-primary shadow-md scale-105"
    : "bg-white text-primary border-primary hover:bg-primary hover:text-white";

  const downvoteClasses = isActive
    ? "bg-red text-white border-red shadow-md scale-105"
    : "bg-white text-red border-red/50 hover:bg-red/50 hover:text-white";

  const buttonClasses = `
    ${baseClasses}
    ${isDisabled ? disabledClasses : isUpvote ? upvoteClasses : downvoteClasses}
  `;

  const ArrowIcon = () => (
    <svg
      className="w-4 h-4"
      fill={isActive ? "currentColor" : "none"}
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d={isUpvote ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
      />
    </svg>
  );

  const title = isActive ? `Click to remove your ${type}` : `Click to ${type}`;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={buttonClasses}
      title={title}
    >
      {isLoading ? <LoadingSpinner /> : <ArrowIcon />}
      <span className="text-sm font-medium">{count}</span>
    </button>
  );
};

export const VotingButtons = ({
  alias,
  className = "",
}: VotingButtonsProps) => {
  const [hasMounted, setHasMounted] = useState(false);
  const [votingType, setVotingType] = useState<"upvote" | "downvote" | null>(
    null,
  );

  const { votes, upvote, downvote, isLoading, error, userVoteType } =
    useUserVoting(alias);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Show loading placeholder during SSR and initial data loading
  // But NOT when we're actively voting (so button spinners can show)
  if (!hasMounted || (isLoading && votingType === null)) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="animate-pulse bg-gray-200 h-8 w-16 rounded" />
        <div className="animate-pulse bg-gray-200 h-8 w-16 rounded" />
      </div>
    );
  }

  // Fail silently on error
  if (error) {
    console.error("Voting error:", error);
    return null;
  }

  const handleVote = async (
    type: "upvote" | "downvote",
    voteFunction: () => Promise<void>,
  ) => {
    // Prevent voting if already in process of voting (race condition protection)
    if (votingType !== null) {
      return;
    }

    setVotingType(type);
    try {
      await voteFunction();
    } finally {
      setVotingType(null);
    }
  };

  const hasUpvoted = userVoteType === "upvote";
  const hasDownvoted = userVoteType === "downvote";
  const isVoting = votingType !== null;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <VoteButton
        type="upvote"
        count={votes.upvote}
        isActive={hasUpvoted}
        isLoading={votingType === "upvote"}
        isDisabled={isVoting}
        onClick={() => handleVote("upvote", upvote)}
      />
      <VoteButton
        type="downvote"
        count={votes.downvote}
        isActive={hasDownvoted}
        isLoading={votingType === "downvote"}
        isDisabled={isVoting}
        onClick={() => handleVote("downvote", downvote)}
      />
    </div>
  );
};
