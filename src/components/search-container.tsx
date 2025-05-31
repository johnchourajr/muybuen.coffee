"use client";
import SearchInput from "@/components/search-input";
import { SearchResults } from "@/components/search-results";
import { AppContext } from "@/contexts/appContext";
import { ScoredBusiness } from "@/lib/coffee-shop-scoring";
import { apiUrls } from "@/lib/url-utils";
import { SearchResult } from "@/types/search.types";
import { useContext } from "react";

export const SearchContainer = () => {
  const { searchResults, setSearchResults } = useContext(AppContext);

  const handleSearch = async (location: string) => {
    try {
      const response = await fetch(apiUrls.search.yelp(location));
      if (!response.ok) {
        throw new Error("Search failed");
      }
      const data: SearchResult = await response.json();

      // Cast Business[] to ScoredBusiness[] with default scoring values
      const scoredBusinesses: ScoredBusiness[] = data.data.map((business) => ({
        ...business,
        buentag: business.buentag as "buen" | "shitlist" | undefined,
        totalScore: 0,
        voteScore: 0,
        qualityScore: 0,
        distanceScore: 0,
        categoryBonus: 0,
      }));

      setSearchResults(scoredBusinesses);
    } catch (error) {
      console.error("Failed to fetch:", error);
    }
  };

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
          />
        </div>
      </div>
      <SearchResults />
    </>
  );
};
