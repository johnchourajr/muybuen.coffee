"use client";
import { ScrollXWrapper } from "@/components/scroll-x-wrapper";
import { AppContext } from "@/contexts/appContext";
import { useBuenLists } from "@/hooks/useBuenLists";
import { useVoteTallies } from "@/hooks/useVoteTallies";
import { getShopListStatus } from "@/utils/shop-lists";
import { useContext, useMemo, useState } from "react";
import { ScoringDevTools } from "./dev/scoring-dev-tools";
import { ResultTile } from "./search-result-tile";
import { BusinessCardContent } from "./ui/business-card-content";

export const SearchResults = () => {
  const { searchResults } = useContext(AppContext);
  const [showScoringBreakdown, setShowScoringBreakdown] = useState(false);

  // Memoize the filtered results to prevent recreating on every render
  const results = useMemo(() => {
    console.log("Filtering search results:", searchResults?.length);
    // Server-side already handles comprehensive scoring and ordering
    // Don't filter by rating here - let the scoring algorithm handle quality assessment
    return searchResults || [];
  }, [searchResults]);

  // Memoize aliases to prevent infinite database calls
  const aliases = useMemo(() => {
    console.log("Creating aliases array from results:", results.length);
    return results.map((result) => result.alias);
  }, [results]);

  // Fetch vote tallies for display purposes (scoring is done server-side)
  const { voteTallies, isLoading: talliesLoading } = useVoteTallies(aliases);

  // Fetch buen lists data for display purposes
  const { entriesByAlias } = useBuenLists(aliases);

  return (
    <>
      <ScrollXWrapper
        disableScroll={results && results?.length <= 0 ? true : false}
      >
        {results && results?.length > 0
          ? results.map((result, index) => {
              // convert meters to miles
              const miles = `${(
                (result.distance || 0) * 0.000621371192
              ).toFixed(2)} miles`;

              // Create clean internal shop URL using the business alias (more SEO-friendly)
              const shopUrl = `/shop/${result.alias}`;

              // Get vote tally for this shop
              const voteTally = voteTallies[result.alias];

              // Get list status for this shop
              const listStatus = getShopListStatus(
                result.alias,
                entriesByAlias,
              );

              return (
                <ResultTile
                  key={index}
                  uid={result.alias}
                  href={shopUrl}
                  className="!p-0"
                >
                  <BusinessCardContent
                    name={result.name}
                    rating={result.rating}
                    reviewCount={result.review_count}
                    address={result.location.display_address}
                    distance={miles}
                    imageUrl={result.image_url}
                    imageAlt={result.name}
                    size="md"
                    showImage={true}
                    showListBadge={true}
                    voteTally={voteTally}
                    business={result}
                    showScoring={process.env.NODE_ENV !== "production"}
                    showScoringBreakdown={showScoringBreakdown}
                    listStatus={listStatus}
                  />
                </ResultTile>
              );
            })
          : ["", "", ""].map((_, index) => <ResultTile key={index} />)}
      </ScrollXWrapper>

      {/* Scoring Controls */}
      <ScoringDevTools
        showScoringBreakdown={showScoringBreakdown}
        setShowScoringBreakdown={setShowScoringBreakdown}
        hasResults={results && results.length > 0}
      />
    </>
  );
};
