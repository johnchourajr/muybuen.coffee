"use client";

import { monitoredFetch } from "@/lib/performance-monitor";
import { apiUrls } from "@/lib/url-utils";
import { Business, SearchResult } from "@/types/search.types";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Query keys factory for consistent cache management
export const searchQueryKeys = {
  all: ["search"] as const,
  yelp: () => [...searchQueryKeys.all, "yelp"] as const,
  yelpByLocation: (
    location: string,
    radius?: string,
    excludeChains?: boolean,
  ) =>
    [...searchQueryKeys.yelp(), { location, radius, excludeChains }] as const,
  googleAutocomplete: () =>
    [...searchQueryKeys.all, "googleAutocomplete"] as const,
  googleAutocompleteByInput: (input: string) =>
    [...searchQueryKeys.googleAutocomplete(), input] as const,
  business: () => [...searchQueryKeys.all, "business"] as const,
  businessById: (id: string) => [...searchQueryKeys.business(), id] as const,
};

// Yelp search hook with intelligent caching
export const useYelpSearch = (
  location: string | null,
  options: {
    radius?: string;
    excludeChains?: boolean;
    enabled?: boolean;
  } = {},
) => {
  const { radius = "2500", excludeChains = true, enabled = true } = options;

  return useQuery({
    queryKey: searchQueryKeys.yelpByLocation(
      location || "",
      radius,
      excludeChains,
    ),
    queryFn: async (): Promise<SearchResult["data"]> => {
      if (!location) throw new Error("Location is required");

      const response = await monitoredFetch(
        apiUrls.search.yelp(location),
        {},
        {
          endpoint: "/api/search/yelp",
          queryParams: {
            location,
            radius,
            excludeChains: excludeChains.toString(),
          },
        },
      );

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data: SearchResult = await response.json();
      return data.data;
    },
    enabled: enabled && !!location && location.length >= 3,
    staleTime: 5 * 60 * 1000, // 5 minutes - results don't change frequently
    gcTime: 15 * 60 * 1000, // 15 minutes - keep in cache longer
    retry: 1,
    // Prevent background refetches for search results
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

// Google Autocomplete hook with aggressive caching and deduplication
export const useGoogleAutocomplete = (
  input: string | null,
  options: { enabled?: boolean; debounceMs?: number } = {},
) => {
  const { enabled = true, debounceMs = 300 } = options;

  return useQuery({
    queryKey: searchQueryKeys.googleAutocompleteByInput(input || ""),
    queryFn: async () => {
      if (!input) throw new Error("Input is required");

      const response = await monitoredFetch(
        apiUrls.search.googleAutocomplete(input),
        {},
        {
          endpoint: "/api/search/googleautocomplete",
          queryParams: { input },
        },
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      return data.data.predictions;
    },
    enabled: enabled && !!input && input.length >= 2,
    staleTime: 10 * 60 * 1000, // 10 minutes - city names don't change
    gcTime: 30 * 60 * 1000, // 30 minutes - keep autocomplete results longer
    retry: 1,
    // Prevent unnecessary background updates
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

// Business details hook with long-term caching
export const useBusinessDetails = (
  businessId: string | null,
  options: { enabled?: boolean } = {},
) => {
  const { enabled = true } = options;

  return useQuery({
    queryKey: searchQueryKeys.businessById(businessId || ""),
    queryFn: async (): Promise<Business> => {
      if (!businessId) throw new Error("Business ID is required");

      const response = await monitoredFetch(
        apiUrls.business(businessId),
        {},
        {
          endpoint: "/api/business",
          queryParams: { id: businessId },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch business details");
      }

      const result = await response.json();
      return result.data;
    },
    enabled: enabled && !!businessId,
    staleTime: 15 * 60 * 1000, // 15 minutes - business details change infrequently
    gcTime: 60 * 60 * 1000, // 1 hour - keep business details very long
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

// Hook to prefetch common searches
export const usePrefetchQueries = () => {
  const queryClient = useQueryClient();

  const prefetchYelpSearch = async (
    location: string,
    options: { radius?: string; excludeChains?: boolean } = {},
  ) => {
    const { radius = "2500", excludeChains = true } = options;

    await queryClient.prefetchQuery({
      queryKey: searchQueryKeys.yelpByLocation(location, radius, excludeChains),
      queryFn: async () => {
        const response = await monitoredFetch(
          apiUrls.search.yelp(location),
          {},
          {
            endpoint: "/api/search/yelp",
            queryParams: {
              location,
              radius,
              excludeChains: excludeChains.toString(),
            },
          },
        );
        const data: SearchResult = await response.json();
        return data.data;
      },
      staleTime: 5 * 60 * 1000,
    });
  };

  const prefetchBusinessDetails = async (businessId: string) => {
    await queryClient.prefetchQuery({
      queryKey: searchQueryKeys.businessById(businessId),
      queryFn: async () => {
        const response = await monitoredFetch(
          apiUrls.business(businessId),
          {},
          { endpoint: "/api/business", queryParams: { id: businessId } },
        );
        const result = await response.json();
        return result.data;
      },
      staleTime: 15 * 60 * 1000,
    });
  };

  return {
    prefetchYelpSearch,
    prefetchBusinessDetails,
  };
};

// Hook to manage cache invalidation and optimization
export const useCacheManager = () => {
  const queryClient = useQueryClient();

  const invalidateSearches = () => {
    queryClient.invalidateQueries({ queryKey: searchQueryKeys.all });
  };

  const clearAllCache = () => {
    queryClient.clear();
  };

  const getCacheStats = () => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();

    return {
      totalQueries: queries.length,
      staleQueries: queries.filter((q) => q.isStale()).length,
      fetchingQueries: queries.filter((q) => q.state.fetchStatus === "fetching")
        .length,
      cacheSize: queries.reduce(
        (acc, q) => acc + JSON.stringify(q.state.data || {}).length,
        0,
      ),
    };
  };

  return {
    invalidateSearches,
    clearAllCache,
    getCacheStats,
  };
};
