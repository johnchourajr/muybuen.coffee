import { useRetoolDatabase } from "@muybuen/retool-db-react";
import { useMemo } from "react";

export interface VoteTally {
  alias: string;
  upvotes: number;
  downvotes: number;
  totalVotes: number;
}

export const useVoteTallies = (aliases: string[]) => {
  // Stable string representation of aliases for memoization
  const aliasesKey = useMemo(() => {
    return aliases.sort().join(",");
  }, [aliases]);

  // Query for all votes for the provided aliases
  const votesQuery = useMemo(() => {
    console.log("Creating votesQuery for aliases:", aliases);

    if (!aliases.length) {
      return {
        query: "SELECT * FROM buen_coffee_user_votes WHERE 1=0", // Empty result
        params: [],
      };
    }

    // Create placeholders for aliases ($1, $2, $3, etc.)
    const placeholders = aliases.map((_, index) => `$${index + 1}`).join(", ");

    return {
      query: `SELECT alias, vote_type, COUNT(*) as vote_count
              FROM buen_coffee_user_votes
              WHERE alias IN (${placeholders})
              GROUP BY alias, vote_type`,
      params: aliases.slice(), // Create a copy to avoid reference issues
    };
  }, [aliasesKey]); // Use the stable string key instead of aliases array

  const {
    data: voteData,
    isLoading,
    error,
    refetch,
  } = useRetoolDatabase<{
    alias: string;
    vote_type: "upvote" | "downvote";
    vote_count: number;
  }>("buen_coffee_user_votes", votesQuery);

  // Process the aggregated data into a more usable format
  const voteTallies = useMemo((): Record<string, VoteTally> => {
    const tallies: Record<string, VoteTally> = {};

    // Initialize tallies for all aliases
    aliases.forEach((alias) => {
      tallies[alias] = {
        alias,
        upvotes: 0,
        downvotes: 0,
        totalVotes: 0,
      };
    });

    // Process the vote data
    if (voteData) {
      voteData.forEach((row) => {
        const { alias, vote_type, vote_count } = row;
        if (tallies[alias]) {
          if (vote_type === "upvote") {
            tallies[alias].upvotes = Number(vote_count);
          } else if (vote_type === "downvote") {
            tallies[alias].downvotes = Number(vote_count);
          }
          tallies[alias].totalVotes =
            tallies[alias].upvotes + tallies[alias].downvotes;
        }
      });
    }

    return tallies;
  }, [voteData, aliases]);

  return {
    voteTallies,
    isLoading,
    error,
    refetch,
  };
};
