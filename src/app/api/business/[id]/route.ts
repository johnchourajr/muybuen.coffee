import {
  ApiResponses,
  checkRateLimit,
  getClientIP,
  handleExternalApiError,
  validateRequired,
} from "@/lib/api-utils";
import { NextRequest } from "next/server";

// Cache for business details (simple in-memory cache)
const businessCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    if (checkRateLimit(clientIP, 60, 60 * 1000)) {
      // 60 requests per minute
      return ApiResponses.rateLimit();
    }

    const { id: businessId } = await params;

    // Validate required parameters
    const businessIdError = validateRequired(businessId, "business ID");
    if (businessIdError) {
      return ApiResponses.badRequest(businessIdError);
    }

    // Check cache first
    const cached = businessCache.get(businessId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return ApiResponses.success(cached.data);
    }

    // Validate API key
    if (!process.env.YELP_API_KEY) {
      console.error("YELP_API_KEY not configured");
      return ApiResponses.serverError("Business service configuration error");
    }

    // Build Yelp Business API URL
    const yelpUrl = `https://api.yelp.com/v3/businesses/${businessId}`;

    // Make API request to Yelp Business endpoint
    const response = await fetch(yelpUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.YELP_API_KEY}`,
      },
      next: { revalidate: 600 }, // Cache for 10 minutes
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Yelp Business API error:", response.status, errorText);

      if (response.status === 404) {
        return ApiResponses.notFound("Business not found");
      }
      if (response.status === 429) {
        return ApiResponses.rateLimit("Yelp API rate limit exceeded");
      }
      if (response.status === 401) {
        return ApiResponses.unauthorized("Yelp API authentication failed");
      }

      return ApiResponses.serverError("Business service unavailable");
    }

    const businessData = await response.json();

    if (!businessData) {
      return ApiResponses.notFound("Business not found");
    }

    // Cache the result
    businessCache.set(businessId, {
      data: businessData,
      timestamp: Date.now(),
    });

    // Clean old cache entries (basic cleanup)
    if (businessCache.size > 100) {
      const now = Date.now();
      Array.from(businessCache.entries()).forEach(([key, value]) => {
        if (now - value.timestamp > CACHE_DURATION) {
          businessCache.delete(key);
        }
      });
    }

    return ApiResponses.success(businessData);
  } catch (error) {
    return handleExternalApiError(error, "Yelp Business");
  }
}
