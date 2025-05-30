// app/api/search/yelp.ts

import {
  ApiResponses,
  checkRateLimit,
  getClientIP,
  handleExternalApiError,
  validateRequired,
} from "@/lib/api-utils";
import { processAndScoreBusinesses } from "@/lib/coffee-shop-scoring";
import { NextRequest } from "next/server";

// Cache for search results (simple in-memory cache)
const searchCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    if (checkRateLimit(clientIP, 30, 60 * 1000)) {
      // 30 requests per minute
      return ApiResponses.rateLimit();
    }

    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location");
    const radius = searchParams.get("radius") || "2500";
    const limit = searchParams.get("limit") || "50";
    const excludeChains = searchParams.get("excludeChains") !== "false"; // Default to true, only false if explicitly set

    // Validate required parameters
    const locationError = validateRequired(location, "location");
    if (locationError) {
      return ApiResponses.badRequest(locationError);
    }

    // At this point, location is guaranteed to be a string
    const locationStr = location as string;

    // Validate radius
    const radiusNum = parseInt(radius);
    if (isNaN(radiusNum) || radiusNum < 100 || radiusNum > 40000) {
      return ApiResponses.badRequest(
        "Radius must be between 100 and 40000 meters",
      );
    }

    // Validate limit
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
      return ApiResponses.badRequest("Limit must be between 1 and 50");
    }

    // Check cache (include excludeChains in cache key)
    const cacheKey = `yelp:${locationStr}:${radius}:${limit}:${excludeChains}`;
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return ApiResponses.success(cached.data);
    }

    // Validate API key
    if (!process.env.YELP_API_KEY) {
      console.error("YELP_API_KEY not configured");
      return ApiResponses.serverError("Search service configuration error");
    }

    // Build Yelp API URL
    const yelpUrl = new URL("https://api.yelp.com/v3/businesses/search");
    yelpUrl.searchParams.set("term", "craft coffee");
    yelpUrl.searchParams.set("categories", "coffee");
    yelpUrl.searchParams.set("radius", radius);
    yelpUrl.searchParams.set("limit", limit);
    yelpUrl.searchParams.set("location", locationStr);

    // Make API request
    const response = await fetch(yelpUrl.toString(), {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.YELP_API_KEY}`,
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Yelp API error:", response.status, errorText);

      if (response.status === 429) {
        return ApiResponses.rateLimit("Yelp API rate limit exceeded");
      }
      if (response.status === 401) {
        return ApiResponses.unauthorized("Yelp API authentication failed");
      }

      return ApiResponses.serverError("Yelp search service unavailable");
    }

    const data = await response.json();

    if (!data.businesses || !Array.isArray(data.businesses)) {
      return ApiResponses.serverError("Invalid response from Yelp API");
    }

    // Process and score the results using the database-backed scoring logic
    const processedData = await processAndScoreBusinesses(
      data.businesses,
      excludeChains,
    );

    // Cache the results
    searchCache.set(cacheKey, {
      data: processedData,
      timestamp: Date.now(),
    });

    // Clean old cache entries (basic cleanup)
    if (searchCache.size > 100) {
      const now = Date.now();
      Array.from(searchCache.entries()).forEach(([key, value]) => {
        if (now - value.timestamp > CACHE_DURATION) {
          searchCache.delete(key);
        }
      });
    }

    return ApiResponses.success(processedData);
  } catch (error) {
    return handleExternalApiError(error, "Yelp");
  }
}
