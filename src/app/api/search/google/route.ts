// app/api/search/google.ts

import {
  ApiResponses,
  checkRateLimit,
  getClientIP,
  handleExternalApiError,
  validateCoordinates,
} from "@/lib/api-utils"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    if (checkRateLimit(clientIP, 50, 60 * 1000)) {
      // 50 requests per minute
      return ApiResponses.rateLimit()
    }

    const { searchParams } = new URL(request.url)
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")
    const radius = searchParams.get("radius") || "5000"

    // Validate coordinates
    const coordError = validateCoordinates(lat, lng)
    if (coordError) {
      return ApiResponses.badRequest(coordError)
    }

    // Validate radius
    const radiusNum = parseInt(radius)
    if (isNaN(radiusNum) || radiusNum < 100 || radiusNum > 50000) {
      return ApiResponses.badRequest(
        "Radius must be between 100 and 50000 meters",
      )
    }

    // Validate API key
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      console.error("GOOGLE_MAPS_API_KEY not configured")
      return ApiResponses.serverError("Search service configuration error")
    }

    // Build Google Places API URL
    const googleUrl = new URL(
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
    )
    googleUrl.searchParams.set("location", `${lat},${lng}`)
    googleUrl.searchParams.set("radius", radius)
    googleUrl.searchParams.set("type", "cafe")
    googleUrl.searchParams.set("keyword", "coffee")
    googleUrl.searchParams.set("key", process.env.GOOGLE_MAPS_API_KEY)

    const response = await fetch(googleUrl.toString(), {
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Google Places API error:", response.status, errorText)

      if (response.status === 429) {
        return ApiResponses.rateLimit("Google Places API rate limit exceeded")
      }
      if (response.status === 403) {
        return ApiResponses.unauthorized(
          "Google Places API authentication failed",
        )
      }

      return ApiResponses.serverError(
        "Google Places search service unavailable",
      )
    }

    const data = await response.json()

    // Validate response structure
    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error(
        "Google Places API status error:",
        data.status,
        data.error_message,
      )

      if (data.status === "REQUEST_DENIED") {
        return ApiResponses.unauthorized("Google Places API access denied")
      }
      if (data.status === "OVER_QUERY_LIMIT") {
        return ApiResponses.rateLimit("Google Places API quota exceeded")
      }

      return ApiResponses.serverError(`Google Places API error: ${data.status}`)
    }

    // Return successful response with enhanced data structure
    return ApiResponses.success({
      results: data.results || [],
      status: data.status,
      next_page_token: data.next_page_token,
    })
  } catch (error) {
    return handleExternalApiError(error, "Google Places Search")
  }
}
