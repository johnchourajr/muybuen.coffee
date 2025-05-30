// app/api/search/google.ts

import {
  ApiResponses,
  checkRateLimit,
  getClientIP,
  handleExternalApiError,
  validateRequired,
} from "@/lib/api-utils"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    if (checkRateLimit(clientIP, 100, 60 * 1000)) {
      // 100 requests per minute
      return ApiResponses.rateLimit()
    }

    const { searchParams } = new URL(request.url)
    const place_id = searchParams.get("place_id")

    // Validate required parameters
    const placeIdError = validateRequired(place_id, "place_id")
    if (placeIdError) {
      return ApiResponses.badRequest(placeIdError)
    }

    // Validate place_id format (basic validation)
    const placeIdStr = place_id as string
    if (placeIdStr.length < 10 || placeIdStr.length > 255) {
      return ApiResponses.badRequest("Invalid place_id format")
    }

    // Validate API key
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      console.error("GOOGLE_MAPS_API_KEY not configured")
      return ApiResponses.serverError(
        "Place detail service configuration error",
      )
    }

    // Build Google Places API URL with comprehensive fields
    const googleUrl = new URL(
      "https://maps.googleapis.com/maps/api/place/details/json",
    )
    googleUrl.searchParams.set("place_id", placeIdStr)
    googleUrl.searchParams.set("key", process.env.GOOGLE_MAPS_API_KEY)
    googleUrl.searchParams.set(
      "fields",
      "place_id,name,formatted_address,geometry,rating,price_level,opening_hours,website,formatted_phone_number,photos,reviews,types",
    )

    const response = await fetch(googleUrl.toString(), {
      next: { revalidate: 600 }, // Cache for 10 minutes (place details change less frequently)
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

      return ApiResponses.serverError("Place detail service unavailable")
    }

    const data = await response.json()

    // Validate response structure
    if (data.status !== "OK") {
      console.error(
        "Google Places API status error:",
        data.status,
        data.error_message,
      )

      if (data.status === "NOT_FOUND") {
        return ApiResponses.notFound("Place not found")
      }
      if (data.status === "REQUEST_DENIED") {
        return ApiResponses.unauthorized("Google Places API access denied")
      }
      if (data.status === "OVER_QUERY_LIMIT") {
        return ApiResponses.rateLimit("Google Places API quota exceeded")
      }

      return ApiResponses.serverError(`Google Places API error: ${data.status}`)
    }

    // Return successful response
    return ApiResponses.success({
      result: data.result || {},
      status: data.status,
    })
  } catch (error) {
    return handleExternalApiError(error, "Google Places Detail")
  }
}
