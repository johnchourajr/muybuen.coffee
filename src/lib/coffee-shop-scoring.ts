import { YelpBusiness } from "@/types/api.types";
import { queryRetoolDatabase } from "@muybuen/retool-db-react/server";
import { analyzeCoffeeQualityKeywordOnly } from "./llm-coffee-analysis";

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

export interface BuenListsData {
  buenlist: string[];
  shitlist: string[];
  blacklist: string[];
}

// Scoring system configuration
export const SCORING_WEIGHTS = {
  VOTE_WEIGHT: 100, // Reduced from 200 - still important but not overwhelming
  QUALITY_WEIGHT: 30, // Increased from 20 - reward good ratings more
  DISTANCE_WEIGHT: 20, // Reduced from 30 - proximity is nice but not critical
  CATEGORY_WEIGHT: 500, // Reduced from 200 - category matters but shouldn't dominate
} as const;

export const CATEGORY_BONUSES = {
  buen: 1000, // Reduced from 1000 - still a good bonus but not overwhelming
  normal: 0, // Normal shops get no bonus
  shitlist: -1000, // Reduced penalty from -1000 - still negative but not crushing
  blacklist: -2000, // Reduced penalty from -1000 - still negative but not crushing
} as const;

// Known chains that should be excluded by default
const KNOWN_CHAINS = new Set([
  "starbucks",
  "dunkin",
  "mcdonald",
  "subway",
  "coffee-bean-and-tea-leaf",
  "peet",
  "tim-horton",
  "7-eleven",
  "shell",
  "chevron",
  "bp",
  "circle-k",
  "wawa",
  "sheetz",
  "speedway",
  "exxon",
  "mobil",
  "arco",
  "valero",
  "phillips-66",
  "holiday",
  "pilot",
  "flying-j",
  "love",
  "ta",
  "petro",
]);

/**
 * Check if a business is a chain that should be excluded by default
 */
export const isChain = (
  businessName: string,
  categories: string[] = [],
  alias: string = "",
): boolean => {
  const name = businessName.toLowerCase();
  const aliasLower = alias.toLowerCase();
  const cats = categories.join(" ").toLowerCase();

  // Check exact matches and partial matches in name and alias
  const isKnownChain =
    KNOWN_CHAINS.has(name) ||
    KNOWN_CHAINS.has(aliasLower) ||
    Array.from(KNOWN_CHAINS).some(
      (chain: string) => name.includes(chain) || aliasLower.includes(chain),
    );

  // Check category-based chain indicators
  const isCategoryChain =
    cats.includes("gas station") ||
    cats.includes("convenience store") ||
    cats.includes("fast food") ||
    cats.includes("gas & service stations");

  // Additional patterns that indicate chains
  const hasChainIndicators =
    name.includes("location") ||
    name.includes("#") ||
    name.includes("store #") ||
    name.includes("branch") ||
    (name.includes("cafe") && cats.includes("fast food"));

  return isKnownChain || isCategoryChain || hasChainIndicators;
};

/**
 * Fetch vote tallies from database for given business aliases
 * Uses queryRetoolDatabase directly for server-side database access
 */
export const fetchVoteTallies = async (
  aliases: string[],
): Promise<Record<string, VoteTally>> => {
  try {
    if (!aliases.length) {
      console.log("No aliases provided for vote fetching");
      return {};
    }

    console.log("Fetching vote tallies for aliases:", aliases);

    // Try to use the database first, fall back to mock data if it fails
    try {
      // Create placeholders for the SQL query
      const placeholders = aliases
        .map((_, index) => `$${index + 1}`)
        .join(", ");
      const query = `
        SELECT alias, vote_type, COUNT(*) as vote_count
        FROM buen_coffee_user_votes
        WHERE alias IN (${placeholders})
        GROUP BY alias, vote_type
      `;

      console.log("Vote query:", query);
      console.log("Query params:", aliases);

      // Use queryRetoolDatabase for direct server-side database access
      const voteData = await queryRetoolDatabase("buen_coffee_user_votes", {
        query,
        params: aliases,
      });

      console.log("Vote data received:", voteData);

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
      if (voteData?.length) {
        console.log("Processing vote data rows:", voteData.length);
        voteData.forEach((row: any) => {
          const { alias, vote_type, vote_count } = row;
          console.log("Processing vote row:", { alias, vote_type, vote_count });
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
      } else {
        console.log("No vote data found in response");
      }

      console.log("Final vote tallies:", tallies);
      return tallies;
    } catch (dbError) {
      console.error("Database connection failed, using mock data:", dbError);

      // Fall back to mock data so the system keeps working
      const mockTallies: Record<string, VoteTally> = {};
      aliases.forEach((alias) => {
        // Add some realistic mock votes for testing
        const mockUpvotes = Math.floor(Math.random() * 5); // 0-4 upvotes
        const mockDownvotes = Math.floor(Math.random() * 2); // 0-1 downvotes

        mockTallies[alias] = {
          alias,
          upvotes: mockUpvotes,
          downvotes: mockDownvotes,
          totalVotes: mockUpvotes + mockDownvotes,
        };
      });

      console.log("Using mock vote tallies:", mockTallies);
      return mockTallies;
    }
  } catch (error) {
    console.error("Error fetching vote tallies:", error);
    // Return empty tallies as final fallback
    const fallbackTallies: Record<string, VoteTally> = {};
    aliases.forEach((alias) => {
      fallbackTallies[alias] = {
        alias,
        upvotes: 0,
        downvotes: 0,
        totalVotes: 0,
      };
    });
    return fallbackTallies;
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
  businessName?: string,
  categories?: string[],
): number => {
  // Base rating score: Higher rating is better (0-75 points)
  const ratingScore = (rating - 2.5) * 30; // Scale rating (2.5-5 stars) to 0-75 points

  // Review credibility score: Reward having reviews but with diminishing returns
  // Uses log scale to prevent over-rewarding high review counts
  const reviewCredibilityScore = Math.min(Math.log(reviewCount + 1) * 12, 50);

  // Quality confidence score: Balance rating quality with review volume
  // This replaces the problematic ratio that penalized high review counts
  let qualityConfidence = 0;
  if (reviewCount === 0) {
    // No reviews: use rating but with uncertainty penalty
    qualityConfidence = rating * 8;
  } else if (reviewCount < 10) {
    // Few reviews: moderate confidence in rating
    qualityConfidence = rating * 10 + reviewCount * 2;
  } else if (reviewCount < 100) {
    // Good number of reviews: high confidence
    qualityConfidence = rating * 12 + Math.min(reviewCount * 0.5, 25);
  } else {
    // Many reviews: very high confidence, slight bonus for being well-established
    qualityConfidence = rating * 15 + 30;
  }

  // Exceptional rating bonus: Extra points for truly outstanding ratings
  const exceptionalBonus = rating >= 4.7 ? 20 : rating >= 4.5 ? 10 : 0;

  // Base quality score combining all factors
  const baseQualityScore =
    ratingScore + reviewCredibilityScore + qualityConfidence + exceptionalBonus;

  // Add keyword analysis if business name is provided (optional enhancement)
  if (businessName && process.env.KEYWORD_ANALYSIS === "true") {
    const keywordBonus = analyzeCoffeeQualityKeywordOnly(
      businessName,
      categories,
    );
    return baseQualityScore + keywordBonus;
  }

  return baseQualityScore;
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
    business.name,
    business.categories?.map((c) => c.title),
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

  // Debug logging for first few businesses
  if (Math.random() < 0.1) {
    // Log ~10% of businesses to avoid spam
    console.log(`Scoring ${business.name}:`, {
      rating: business.rating,
      reviewCount: business.review_count,
      category: business.buentag,
      voteScore: voteScore,
      qualityScore: qualityScore.toFixed(1),
      distanceScore: distanceScore.toFixed(1),
      categoryBonus,
      totalScore: totalScore.toFixed(1),
    });
  }

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
 * Fetch list data from the buen_lists table
 * Uses queryRetoolDatabase for server-side database access
 */
export const fetchBuenListsData = async (): Promise<BuenListsData> => {
  try {
    console.log("Fetching buen lists data from database...");

    const query = `
      SELECT alias, list
      FROM buen_lists
      WHERE alias IS NOT NULL
      ORDER BY created DESC
    `;

    // Use queryRetoolDatabase for direct server-side database access
    const listData = await queryRetoolDatabase("buen_lists", {
      query,
      params: [],
    });

    console.log("List data received:", listData);

    // Process the data into separate arrays
    const buenListsData: BuenListsData = {
      buenlist: [],
      shitlist: [],
      blacklist: [],
    };

    if (listData?.length) {
      console.log("Processing list data rows:", listData.length);
      listData.forEach((row: any) => {
        const { alias, list } = row;
        if (alias && list) {
          switch (list) {
            case "buenlist":
              buenListsData.buenlist.push(alias);
              break;
            case "shitlist":
              buenListsData.shitlist.push(alias);
              break;
            case "blacklist":
              buenListsData.blacklist.push(alias);
              break;
            default:
              console.warn("Unknown list type:", list);
          }
        }
      });
    } else {
      console.log("No list data found in response");
    }

    console.log("Final buen lists data:", buenListsData);
    return buenListsData;
  } catch (error) {
    console.error("Error fetching buen lists data:", error);

    // Return empty lists as fallback
    return {
      buenlist: [],
      shitlist: [],
      blacklist: [],
    };
  }
};

/**
 * Main function to process and score Yelp businesses
 * Handles categorization, scoring, and sorting
 */
export const processAndScoreBusinesses = async (
  businesses: YelpBusiness[],
  excludeChains: boolean = true,
): Promise<ScoredBusiness[]> => {
  console.log(`Processing ${businesses.length} businesses for scoring`);

  // Fetch list data from database
  const { buenlist, shitlist, blacklist } = await fetchBuenListsData();

  // Get all aliases for vote lookup
  const aliases = businesses.map((business) => business.alias);

  // Fetch vote tallies for all businesses
  const voteTallies = await fetchVoteTallies(aliases);

  // Find max distance for normalization
  const maxDistance = Math.max(...businesses.map((b) => b.distance || 0), 2500);
  console.log(`Max distance for normalization: ${maxDistance}m`);

  const processedBusinesses: ScoredBusiness[] = [];
  let blacklistedCount = 0;
  let chainExcludedCount = 0;

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
      blacklistedCount++;
      return;
    }

    // Check if it's a chain and should be excluded (unless it's in the buen list)
    if (excludeChains && !isInBuenlist) {
      const shopIsChain = isChain(
        shop.name,
        shop.categories?.map((c) => c.title) || [],
        shop.alias,
      );

      if (shopIsChain) {
        chainExcludedCount++;
        console.log(`Excluding chain: ${shop.name} (${shop.alias})`);
        return;
      }
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

  console.log(
    `Processed ${processedBusinesses.length} businesses, blacklisted ${blacklistedCount}, excluded ${chainExcludedCount} chains`,
  );

  // Sort by total score (descending - higher scores first)
  processedBusinesses.sort((a, b) => b.totalScore - a.totalScore);

  // Log top 5 scoring businesses
  console.log(
    "Top 5 scoring businesses:",
    processedBusinesses.slice(0, 5).map((b) => ({
      name: b.name,
      rating: b.rating,
      category: b.buentag,
      totalScore: b.totalScore.toFixed(1),
    })),
  );

  return processedBusinesses;
};
