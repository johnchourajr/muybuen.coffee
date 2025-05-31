"use client";
import SearchInput from "@/components/search-input";
import { SearchResults } from "@/components/search-results";
import { AppContext } from "@/contexts/appContext";
import { useYelpSearch } from "@/hooks/useSearchQueries";
import { useCallback, useContext, useEffect, useState } from "react";

export const SearchContainer = () => {
  const { searchResults, setSearchResults } = useContext(AppContext);
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);

  // Use React Query for search with automatic caching and deduplication
  const {
    data: yelpData,
    isLoading,
    error,
  } = useYelpSearch(currentLocation, {
    enabled: !!currentLocation && currentLocation.length >= 3,
  });

  // Update search results when query data changes
  useEffect(() => {
    if (yelpData) {
      setSearchResults(yelpData);
    }
  }, [yelpData, setSearchResults]);

  const handleSearch = useCallback((location: string) => {
    // This will trigger the React Query hook to fetch data
    // If the same location is searched again, it will use cached data
    setCurrentLocation(location);
  }, []);

  // Filter results to only show high-rated businesses (rating > 4) for the count
  const filteredResults =
    searchResults?.filter((item) => item.rating > 4) || [];

  return (
    <>
      <div className="grid-container">
        <div className="col-span-full pt-0 pb-6 relative z-20">
          <SearchInput
            onSearch={handleSearch}
            number={filteredResults?.length}
            isLoading={isLoading}
          />
        </div>
      </div>
      <SearchResults />
      {error && (
        <div className="text-red-500 text-center p-4">
          Error loading results: {error.message}
        </div>
      )}
    </>
  );
};
