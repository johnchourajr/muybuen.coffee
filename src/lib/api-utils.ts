// API utilities for consistent error handling, validation, and responses
import { NextResponse } from "next/server"

// Standard API error responses
export const ApiResponses = {
  success: (data: any) => NextResponse.json({ success: true, data }),

  error: (message: string, status = 500) =>
    NextResponse.json({ success: false, error: message }, { status }),

  badRequest: (message = "Invalid request") =>
    NextResponse.json({ success: false, error: message }, { status: 400 }),

  unauthorized: (message = "Unauthorized") =>
    NextResponse.json({ success: false, error: message }, { status: 401 }),

  notFound: (message = "Not found") =>
    NextResponse.json({ success: false, error: message }, { status: 404 }),

  methodNotAllowed: (message = "Method not allowed") =>
    NextResponse.json({ success: false, error: message }, { status: 405 }),

  rateLimit: (message = "Rate limit exceeded") =>
    NextResponse.json({ success: false, error: message }, { status: 429 }),

  serverError: (message = "Internal server error") =>
    NextResponse.json({ success: false, error: message }, { status: 500 }),
}

// Input validation helpers
export const validateRequired = (
  value: any,
  fieldName: string,
): string | null => {
  if (!value || (typeof value === "string" && value.trim() === "")) {
    return `${fieldName} is required`
  }
  return null
}

export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return "Invalid email format"
  }
  return null
}

export const validateCoordinates = (
  lat: string | null,
  lng: string | null,
): string | null => {
  if (!lat || !lng) {
    return "Latitude and longitude are required"
  }

  const latNum = parseFloat(lat)
  const lngNum = parseFloat(lng)

  if (isNaN(latNum) || isNaN(lngNum)) {
    return "Invalid coordinate format"
  }

  if (latNum < -90 || latNum > 90) {
    return "Latitude must be between -90 and 90"
  }

  if (lngNum < -180 || lngNum > 180) {
    return "Longitude must be between -180 and 180"
  }

  return null
}

// Rate limiting (simple in-memory implementation)
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export const checkRateLimit = (
  identifier: string,
  maxRequests = 100,
  windowMs = 60 * 1000, // 1 minute
): boolean => {
  const now = Date.now()
  const userRequests = requestCounts.get(identifier)

  if (!userRequests || now > userRequests.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + windowMs })
    return false
  }

  if (userRequests.count >= maxRequests) {
    return true // Rate limited
  }

  userRequests.count++
  return false
}

// Get client IP address
export const getClientIP = (request: Request): string => {
  const xForwardedFor = request.headers.get("x-forwarded-for")
  const xRealIp = request.headers.get("x-real-ip")
  const cfConnectingIp = request.headers.get("cf-connecting-ip")

  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim()
  }

  return xRealIp || cfConnectingIp || "unknown"
}

// External API error handler
export const handleExternalApiError = (error: any, apiName: string) => {
  console.error(`${apiName} API Error:`, error)

  if (error.message?.includes("Rate limit")) {
    return ApiResponses.rateLimit(`${apiName} rate limit exceeded`)
  }

  if (
    error.message?.includes("Unauthorized") ||
    error.message?.includes("Invalid API key")
  ) {
    return ApiResponses.unauthorized(`${apiName} authentication failed`)
  }

  return ApiResponses.serverError(`${apiName} service unavailable`)
}
