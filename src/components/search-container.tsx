"use client";
import SearchInput from "@/components/search-input";
import { SearchResults } from "@/components/search-results";
import { AppContext } from "@/contexts/appContext";
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
      setSearchResults(data.data); // Yelp API returns businesses in a 'businesses' array
      // console.log(data)
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
