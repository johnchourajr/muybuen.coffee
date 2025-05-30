"use client";
import { ScrollXWrapper } from "@/components/scroll-x-wrapper";
import { AppContext } from "@/contexts/appContext";
import { useContext } from "react";
import { ResultTile } from "./search-result-tile";
import { BusinessCardContent } from "./ui/business-card-content";

export const SearchResults = () => {
  const { searchResults } = useContext(AppContext);

  // Filter results to only show high-rated businesses (rating > 4)
  const results = searchResults?.filter((item) => item.rating > 4) || [];

  return (
    <>
      <ScrollXWrapper
        disableScroll={results && results?.length <= 0 ? true : false}
      >
        {results && results?.length > 0
          ? results.map((result, index) => {
              // convert meters to miles
              const miles = `${(result.distance * 0.000621371192).toFixed(
                2,
              )} miles`;

              // Create clean internal shop URL using the business alias (more SEO-friendly)
              const shopUrl = `/shop/${result.alias}`;

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
                    buentag={result.buentag}
                    shopAlias={result.alias}
                    size="md"
                    showImage={true}
                    showListBadge={true}
                  />
                </ResultTile>
              );
            })
          : ["", "", ""].map((_, index) => <ResultTile key={index} />)}
      </ScrollXWrapper>
    </>
  );
};
