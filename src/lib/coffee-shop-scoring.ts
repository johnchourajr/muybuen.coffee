import { apiUrls } from "@/lib/url-utils";
import { YelpBusiness } from "@/types/api.types";

export interface VoteTally {
  alias: string;
  upvotes: number;
  downvotes: number;
  totalVotes: number;
}

export interface ScoredBusiness extends YelpBusiness {
  totalScore: number;
  voteScore: number;
  qualityScore: number;
  distanceScore: number;
  categoryBonus: number;
}

// Scoring system configuration
export const SCORING_WEIGHTS = {
  VOTE_WEIGHT: 200, // Highest weight for community votes
  QUALITY_WEIGHT: 50, // Rating vs review count quality
  DISTANCE_WEIGHT: 30, // Proximity bonus
  CATEGORY_WEIGHT: 200, // Category tier bonus
} as const;

export const CATEGORY_BONUSES = {
  buen: 1000, // Buenlist gets highest bonus
  normal: 0, // Normal shops get no bonus
  shitlist: -500, // Shitlist gets penalty
} as const;

/**
 * Fetch vote tallies from database for given business aliases
 */
export const fetchVoteTallies = async (
  aliases: string[],
): Promise<Record<string, VoteTally>> => {
  try {
    if (!aliases.length) return {};

    // Create placeholders for the SQL query
    const placeholders = aliases.map((_, index) => `$${index + 1}`).join(", ");

    const query = `
      SELECT alias, vote_type, COUNT(*) as vote_count
      FROM buen_coffee_user_votes
      WHERE alias IN (${placeholders})
      GROUP BY alias, vote_type
    `;

    // Make request to our Retool DB API using centralized URL utility
    const response = await fetch(apiUrls.retoolDb("buen_coffee_user_votes"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        params: aliases,
      }),
    });

    if (!response.ok) {
      console.error("Failed to fetch vote tallies:", response.status);
      return {};
    }

    const voteData = await response.json();

    // Process the data into vote tallies
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
    if (voteData?.data) {
      voteData.data.forEach((row: any) => {
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
  } catch (error) {
    console.error("Error fetching vote tallies:", error);
    return {};
  }
};

/**
 * Calculate vote score (upvotes - downvotes)
 */
export const calculateVoteScore = (voteTally?: VoteTally): number => {
  if (!voteTally) return 0;
  return voteTally.upvotes - voteTally.downvotes;
};

/**
 * Calculate quality score based on rating and review count
 * Uses multiple factors to prevent chain dominance and reward genuine quality
 */
export const calculateQualityScore = (
  rating: number,
  reviewCount: number,
): number => {
  // Quality ratio: Higher rating is better, but we want shops with reasonable review counts
  // Diminishing returns for very high review counts to prevent chain dominance
  const ratingScore = (rating - 3) * 20; // Scale rating (3-5 stars) to 0-40 points
  const reviewScore = Math.min(Math.log(reviewCount + 1) * 5, 25); // Log scale, max 25 points
  const qualityRatio =
    reviewCount > 0 ? (rating / Math.sqrt(reviewCount)) * 10 : 0;

  return ratingScore + reviewScore + qualityRatio;
};

/**
 * Calculate distance score (closer is better)
 * Normalizes distance to a 0-100 scale
 */
export const calculateDistanceScore = (
  distance: number,
  maxDistance: number = 2500,
): number => {
  // Invert distance so closer gets higher score
  const normalizedDistance = Math.max(0, Math.min(distance, maxDistance));
  return ((maxDistance - normalizedDistance) / maxDistance) * 100;
};

/**
 * Get category bonus based on business classification
 */
export const getCategoryBonus = (buentag?: string): number => {
  if (buentag === "buen") return CATEGORY_BONUSES.buen;
  if (buentag === "shitlist") return CATEGORY_BONUSES.shitlist;
  return CATEGORY_BONUSES.normal;
};

/**
 * Calculate comprehensive score for a business
 * Combines all scoring factors with appropriate weights
 */
export const calculateTotalScore = (
  business: YelpBusiness,
  voteTally?: VoteTally,
  maxDistance: number = 2500,
): ScoredBusiness => {
  const voteScore = calculateVoteScore(voteTally);
  const qualityScore = calculateQualityScore(
    business.rating,
    business.review_count,
  );
  const distanceScore = calculateDistanceScore(
    business.distance || 0,
    maxDistance,
  );
  const categoryBonus = getCategoryBonus(business.buentag);

  const totalScore =
    voteScore * SCORING_WEIGHTS.VOTE_WEIGHT +
    qualityScore * SCORING_WEIGHTS.QUALITY_WEIGHT +
    distanceScore * SCORING_WEIGHTS.DISTANCE_WEIGHT +
    categoryBonus;

  return {
    ...business,
    totalScore,
    voteScore,
    qualityScore,
    distanceScore,
    categoryBonus,
  };
};

/**
 * Main function to process and score Yelp businesses
 * Handles categorization, scoring, and sorting
 */
export const processAndScoreBusinesses = async (
  businesses: YelpBusiness[],
  buenlist: string[],
  shitlist: string[],
  blacklist: string[],
): Promise<ScoredBusiness[]> => {
  // Get all aliases for vote lookup
  const aliases = businesses.map((business) => business.alias);

  // Fetch vote tallies for all businesses
  const voteTallies = await fetchVoteTallies(aliases);

  // Find max distance for normalization
  const maxDistance = Math.max(...businesses.map((b) => b.distance || 0), 2500);

  const processedBusinesses: ScoredBusiness[] = [];

  businesses.forEach((shop) => {
    // Check if shop.alias contains any word in the lists
    const isInBuenlist = buenlist.some((keyword) =>
      shop.alias.includes(keyword),
    );
    const isInShitlist = shitlist.some((keyword) =>
      shop.alias.includes(keyword),
    );
    const isInBlacklist = blacklist.some((keyword) =>
      shop.alias.includes(keyword),
    );

    if (isInBlacklist) {
      // Skip blacklisted shops
      return;
    }

    // Add category tag
    let taggedShop = { ...shop };
    if (isInBuenlist) {
      taggedShop.buentag = "buen";
    } else if (isInShitlist) {
      taggedShop.buentag = "shitlist";
    }

    // Calculate comprehensive score
    const scoredBusiness = calculateTotalScore(
      taggedShop,
      voteTallies[shop.alias],
      maxDistance,
    );

    processedBusinesses.push(scoredBusiness);
  });

  // Sort by total score (descending - higher scores first)
  processedBusinesses.sort((a, b) => b.totalScore - a.totalScore);

  return processedBusinesses;
};
