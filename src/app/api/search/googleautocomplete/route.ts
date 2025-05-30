// app/api/search/googleautocomplete/route.ts

import {
  ApiResponses,
  checkRateLimit,
  getClientIP,
  handleExternalApiError,
  validateRequired,
} from "@/lib/api-utils"
import { NextRequest } from "next/server"

// const getIpAddress = (req: Request): string => {
//   const xForwardedFor = req.headers.get("x-forwarded-for")
//   const ipAddress = Array.isArray(xForwardedFor)
//     ? xForwardedFor[0]
//     : xForwardedFor
//   return ipAddress || "unknown"
// }

export async function GET(request: NextRequest) {
  // const ipAddress = getIpAddress(request)

  // if (rateLimit(ipAddress)) {
  //   return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
  //     status: 429,
  //     headers: { "Content-Type": "application/json" },
  //   })
  // }

  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    if (checkRateLimit(clientIP, 100, 60 * 1000)) {
      // 100 requests per minute
      return ApiResponses.rateLimit()
    }

    const { searchParams } = new URL(request.url)
    const input = searchParams.get("input")

    // Validate required parameters
    const inputError = validateRequired(input, "input")
    if (inputError) {
      return ApiResponses.badRequest(inputError)
    }

    // Validate input length
    const inputStr = input as string
    if (inputStr.length < 2) {
      return ApiResponses.badRequest("Input must be at least 2 characters long")
    }

    if (inputStr.length > 100) {
      return ApiResponses.badRequest("Input must be less than 100 characters")
    }

    // Validate API key
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      console.error("GOOGLE_MAPS_API_KEY not configured")
      return ApiResponses.serverError(
        "Autocomplete service configuration error",
      )
    }

    // Build Google Places API URL
    const googleUrl = new URL(
      "https://maps.googleapis.com/maps/api/place/autocomplete/json",
    )
    googleUrl.searchParams.set("input", inputStr)
    googleUrl.searchParams.set("key", process.env.GOOGLE_MAPS_API_KEY)
    googleUrl.searchParams.set("types", "(cities)")

    const response = await fetch(googleUrl.toString(), {
      headers: {
        "Content-Type": "application/json",
      },
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

      return ApiResponses.serverError("Autocomplete service unavailable")
    }

    if (!response.headers.get("Content-Type")?.includes("application/json")) {
      return ApiResponses.serverError(
        "Invalid response format from Google Places API",
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

    // Return successful response
    return ApiResponses.success({
      predictions: data.predictions || [],
      status: data.status,
    })
  } catch (error) {
    return handleExternalApiError(error, "Google Places Autocomplete")
  }
}
