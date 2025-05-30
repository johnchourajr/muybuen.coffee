import { Buen_coffee_user_votes } from "@/types/buen_coffee_user_votes";
import { useRetoolDatabase } from "@muybuen/retool-db-react";
import { useCallback, useEffect, useMemo, useState } from "react";

// Global variable to ensure consistent user ID across all hook instances
let cachedUserId: string | null = null;

// Generate or get user ID from localStorage
const getUserId = (): string => {
  if (typeof window === "undefined") return "";

  // Return cached ID if available
  if (cachedUserId) {
    console.log("Using cached user ID:", cachedUserId);
    return cachedUserId;
  }

  let userId = localStorage.getItem("buen-coffee-user-id");
  if (!userId) {
    // Generate a more stable user ID
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    userId = `user-${timestamp}-${random}`;
    localStorage.setItem("buen-coffee-user-id", userId);
    console.log("Generated new user ID:", userId);
  } else {
    console.log("Retrieved existing user ID from localStorage:", userId);
  }

  // Cache the user ID
  cachedUserId = userId;
  return userId;
};

export const useUserVoting = (alias: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string>("");

  // Get user ID on mount
  useEffect(() => {
    const id = getUserId();
    console.log("useUserVoting: Setting user ID for alias", alias, ":", id);
    setUserId(id);
  }, [alias]);

  // Query for all votes for this shop
  const allVotesQuery = useMemo(
    () => ({
      query: "SELECT * FROM buen_coffee_user_votes WHERE alias = $1",
      params: [alias],
    }),
    [alias],
  );

  // Query for this user's vote - only execute if userId is available
  const userVoteQuery = useMemo(
    () => ({
      query:
        "SELECT * FROM buen_coffee_user_votes WHERE alias = $1 AND user_id = $2",
      params: [alias, userId],
      limit: 1,
    }),
    [alias, userId],
  );

  const {
    data: allVotes,
    isLoading: allVotesLoading,
    error: allVotesError,
    refetch: refetchAllVotes,
  } = useRetoolDatabase<Buen_coffee_user_votes>(
    "buen_coffee_user_votes",
    allVotesQuery,
  );

  const {
    data: userVoteData,
    isLoading: userVoteLoading,
    error: userVoteError,
    insert,
    update,
    remove,
    refetch: refetchUserVote,
  } = useRetoolDatabase<Buen_coffee_user_votes>(
    "buen_coffee_user_votes",
    userVoteQuery,
  );

  const isLoading = allVotesLoading || (userVoteLoading && !!userId);
  const error = allVotesError || userVoteError;

  // Calculate vote counts from all votes
  const votes = useMemo(() => {
    if (!allVotes) return { upvote: 0, downvote: 0 };

    const upvotes = allVotes.filter(
      (vote) => vote.vote_type === "upvote",
    ).length;
    const downvotes = allVotes.filter(
      (vote) => vote.vote_type === "downvote",
    ).length;

    return { upvote: upvotes, downvote: downvotes };
  }, [allVotes]);

  // Get user's current vote
  const userVote = userVoteData?.[0];
  const userVoteType = userVote?.vote_type || null;

  // Debug user vote data changes
  useEffect(() => {
    if (userVoteData) {
      console.log("User vote data changed:", userVoteData);
    }
  }, [userVoteData]);

  // Debug user vote type changes
  useEffect(() => {
    console.log("User vote type changed:", {
      userId,
      alias,
      userVoteType,
      userVote,
    });
  }, [userId, alias, userVoteType, userVote]);

  const handleVote = useCallback(
    async (voteType: "upvote" | "downvote") => {
      if (isSubmitting || !userId) {
        console.log("Vote prevented:", { isSubmitting, userId });
        return;
      }

      console.log("Starting vote:", { voteType, userId, alias, userVote });
      setIsSubmitting(true);

      try {
        if (userVote) {
          if (userVote.vote_type === voteType) {
            // Same vote type - remove the vote (toggle off)
            console.log("Removing vote:", userVote.id);
            await remove({ id: userVote.id });
          } else {
            // Different vote type - update the vote
            console.log("Updating vote:", userVote.id, "to", voteType);
            await update(
              { id: userVote.id },
              {
                vote_type: voteType,
                updated: new Date().toISOString(),
              },
            );
          }
        } else {
          // No existing vote - create new vote
          console.log("Creating new vote:", { alias, userId, voteType });
          await insert({
            alias,
            user_id: userId,
            vote_type: voteType,
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
          });
        }

        // Refetch both queries to get updated data
        console.log("Refetching data...");
        await Promise.all([refetchAllVotes(), refetchUserVote()]);
        console.log("Vote completed successfully");
      } catch (err) {
        console.error("Error voting:", err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      alias,
      userId,
      userVote,
      isSubmitting,
      insert,
      update,
      remove,
      refetchAllVotes,
      refetchUserVote,
    ],
  );

  const upvote = useCallback(() => handleVote("upvote"), [handleVote]);
  const downvote = useCallback(() => handleVote("downvote"), [handleVote]);

  return {
    votes,
    upvote,
    downvote,
    isLoading,
    isSubmitting,
    error,
    userVoteType, // 'upvote', 'downvote', or null
    hasVoted: !!userVote,
  };
};
