/**
 * URL utility functions for consistent base URL handling across the application
 */

/**
 * Get the application base URL
 * Uses environment variables with fallbacks for different environments
 */
export const getBaseUrl = (): string => {
  // For server-side rendering and API calls, we need the full URL
  if (typeof window === "undefined") {
    // Server-side: use environment variable or production domain
    if (process.env.NEXT_PUBLIC_APP_URL) {
      return process.env.NEXT_PUBLIC_APP_URL;
    }

    if (process.env.NODE_ENV === "production") {
      return "https://muybuen.coffee";
    }

    return "http://localhost:3000";
  }

  // Client-side: use the current origin
  return window.location.origin;
};

/**
 * Get API base URL for internal API calls
 * Returns relative URLs for client-side calls, absolute URLs for server-side calls
 */
export const getApiBaseUrl = (): string => {
  if (typeof window === "undefined") {
    // Server-side: need full URL for fetch calls
    return getBaseUrl();
  }

  // Client-side: use relative URLs (more efficient and handles proxy/subdomain scenarios)
  return "";
};

/**
 * Build a complete API URL for internal API endpoints
 */
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  return `${baseUrl}${cleanEndpoint}`;
};

/**
 * Build URLs for specific API endpoints
 */
export const apiUrls = {
  search: {
    yelp: (location: string) =>
      buildApiUrl(`/api/search/yelp?location=${encodeURIComponent(location)}`),
    googleAutocomplete: (input: string) =>
      buildApiUrl(
        `/api/search/googleautocomplete?input=${encodeURIComponent(input)}`,
      ),
  },
  business: (id: string) => buildApiUrl(`/api/business/${id}`),
  retoolDb: (tableName: string) => buildApiUrl(`/api/retool-db/${tableName}`),
} as const;

/**
 * Environment-specific URL helpers
 */
export const isProduction = (): boolean =>
  process.env.NODE_ENV === "production";
export const isDevelopment = (): boolean =>
  process.env.NODE_ENV === "development";

/**
 * External API URLs (for reference, these don't use our base URL)
 */
export const externalApiUrls = {
  yelp: "https://api.yelp.com/v3/businesses/search",
  google: {
    places: {
      autocomplete:
        "https://maps.googleapis.com/maps/api/place/autocomplete/json",
      details: "https://maps.googleapis.com/maps/api/place/details/json",
      nearby: "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
    },
  },
} as const;
