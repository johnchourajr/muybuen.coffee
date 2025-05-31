import { YelpBusiness } from "@/types/api.types";

// LLM analysis cache
const LLM_CACHE = new Map<string, number>();

// Configuration
const BATCH_SIZE = parseInt(process.env.LLM_BATCH_SIZE || "10");
const FAST_MODE = process.env.LLM_FAST_MODE === "true";
const KEYWORD_FIRST = process.env.LLM_KEYWORD_FIRST === "true";

// Known chains that we can skip LLM analysis for
const KNOWN_CHAINS = new Set([
  "starbucks",
  "dunkin",
  "mcdonald",
  "subway",
  "peet",
  "tim-horton",
  "7-eleven",
  "shell",
  "chevron",
  "bp",
  "circle-k",
]);

// Known specialty coffee indicators that don't need LLM
const SPECIALTY_INDICATORS = new Set([
  "blue bottle",
  "intelligentsia",
  "counter culture",
  "stumptown",
  "ritual",
  "four barrel",
  "philz",
  "sightglass",
  "la colombe",
  "verve",
  "roastery",
  "roasters",
  "coffee roasting",
  "single origin",
  "third wave",
]);

/**
 * Check if a business is obviously a chain that doesn't need LLM analysis
 */
function isObviousChain(
  businessName: string,
  categories: string[] = [],
): boolean {
  const name = businessName.toLowerCase();
  const cats = categories.join(" ").toLowerCase();

  return (
    KNOWN_CHAINS.has(name) ||
    Array.from(KNOWN_CHAINS).some((chain: string) => name.includes(chain)) ||
    cats.includes("gas station") ||
    cats.includes("convenience store") ||
    cats.includes("fast food")
  );
}

/**
 * Ultra-fast keyword-based analysis that handles most cases without LLM
 */
function getKeywordScore(
  businessName: string,
  categories: string[] = [],
): { score: number; confidence: "high" | "medium" | "low" } {
  const name = businessName.toLowerCase();
  const cats = categories.join(" ").toLowerCase();
  const combined = `${name} ${cats}`;

  // High confidence negative (chains)
  if (
    KNOWN_CHAINS.has(name) ||
    Array.from(KNOWN_CHAINS).some((chain: string) => name.includes(chain))
  ) {
    return { score: 1, confidence: "high" };
  }

  // High confidence positive (known specialty)
  if (
    Array.from(SPECIALTY_INDICATORS).some((indicator: string) =>
      combined.includes(indicator),
    )
  ) {
    return { score: 9, confidence: "high" };
  }

  // Medium confidence scoring
  let score = 5;

  // Positive indicators
  if (
    combined.includes("specialty") ||
    combined.includes("artisan") ||
    combined.includes("craft")
  )
    score += 2;
  if (combined.includes("independent") || combined.includes("local"))
    score += 1;
  if (combined.includes("organic") || combined.includes("fair trade"))
    score += 1;
  if (name.includes("coffee co") || name.includes("coffee house")) score += 1;

  // Negative indicators
  if (combined.includes("fast food") || combined.includes("convenience"))
    score -= 3;
  if (
    combined.includes("gas station") ||
    combined.includes("shell") ||
    combined.includes("chevron")
  )
    score -= 3;
  if (name.includes("cafe") && !combined.includes("specialty")) score -= 1; // Generic cafes

  score = Math.max(1, Math.min(10, score));

  const confidence =
    score <= 2 || score >= 8
      ? "high"
      : score <= 3 || score >= 7
        ? "medium"
        : "low";

  return { score, confidence };
}

/**
 * Simple keyword-only analysis (no LLM calls)
 * Returns a bonus/penalty score (-20 to +20 points)
 */
export const analyzeCoffeeQualityKeywordOnly = (
  businessName: string,
  categories: string[] = [],
): number => {
  const keywordResult = getKeywordScore(businessName, categories);
  const bonus = (keywordResult.score - 5) * 4;

  console.log(
    `Keyword analysis for "${businessName}": score=${keywordResult.score} → bonus=${bonus}`,
  );
  return bonus;
};

/**
 * Super fast analysis that uses LLM only when keyword analysis is uncertain
 */
export const analyzeCoffeeQualityWithLLM = async (
  businessName: string,
  categories: string[] = [],
): Promise<number> => {
  const LLM_ENABLED = process.env.LLM_QUALITY_ANALYSIS === "true";
  if (!LLM_ENABLED) {
    return analyzeCoffeeQualityKeywordOnly(businessName, categories);
  }

  // Check cache first
  const cacheKey = `${businessName}|${categories.join(",")}`;
  if (LLM_CACHE.has(cacheKey)) {
    return LLM_CACHE.get(cacheKey)!;
  }

  // Always start with keyword analysis
  const keywordResult = getKeywordScore(businessName, categories);
  const bonus = (keywordResult.score - 5) * 4;

  // In keyword-first mode, only use LLM for low-confidence cases
  if (KEYWORD_FIRST && keywordResult.confidence !== "low") {
    console.log(
      `Keyword analysis (${keywordResult.confidence} confidence) for "${businessName}": score=${keywordResult.score} → bonus=${bonus}`,
    );
    LLM_CACHE.set(cacheKey, bonus);
    return bonus;
  }

  // Use LLM only for uncertain cases or when not in keyword-first mode
  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2:1b",
        prompt: `Rate 1-10: "${businessName}" (${categories.join(", ")})`,
        stream: false,
        options: {
          temperature: 0,
          num_predict: 2,
          stop: ["\n", ".", " ", "out", "of"],
        },
      }),
      signal: AbortSignal.timeout(2000),
    });

    if (response.ok) {
      const data = await response.json();
      const numberMatch = data.response.match(/\b([1-9]|10)\b/);
      if (numberMatch) {
        const score = parseInt(numberMatch[0]);
        const llmBonus = (score - 5) * 4;
        LLM_CACHE.set(cacheKey, llmBonus);
        console.log(
          `Fast LLM for "${businessName}": score=${score} → bonus=${llmBonus}`,
        );
        return llmBonus;
      }
    }
  } catch (error) {
    console.log(`LLM timeout for "${businessName}", using keyword fallback`);
  }

  // Fallback to keyword result
  console.log(
    `Keyword fallback for "${businessName}": score=${keywordResult.score} → bonus=${bonus}`,
  );
  LLM_CACHE.set(cacheKey, bonus);
  return bonus;
};

/**
 * Batch process businesses with LLM analysis
 */
export async function processBatchWithLLM(
  businesses: YelpBusiness[],
  batchSize: number = BATCH_SIZE,
): Promise<Array<{ business: YelpBusiness; llmBonus: number }>> {
  const results: Array<{ business: YelpBusiness; llmBonus: number }> = [];

  for (let i = 0; i < businesses.length; i += batchSize) {
    const batch = businesses.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(businesses.length / batchSize);

    console.log(
      `🚀 Processing LLM batch ${batchNum}/${totalBatches} (${batch.length} businesses)`,
    );
    const startTime = Date.now();

    const batchPromises = batch.map(async (business) => {
      const llmBonus = await analyzeCoffeeQualityWithLLM(
        business.name,
        business.categories?.map((c) => c.title),
      );
      return { business, llmBonus };
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    const elapsed = (Date.now() - startTime) / 1000;
    console.log(`✅ Batch ${batchNum} complete in ${elapsed.toFixed(1)}s`);

    // Minimal delay in ultra-fast mode
    const delay = FAST_MODE ? 0 : 50;
    if (i + batchSize < businesses.length && delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return results;
}

export { BATCH_SIZE, FAST_MODE, KEYWORD_FIRST };
