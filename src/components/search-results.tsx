"use client"
import { ScrollXWrapper } from "@/components/scroll-x-wrapper"
import { Business } from "@/types/search.types"
import clsx from "clsx"
import Image from "next/image"
import { ResultTile } from "./search-result-tile"

export type SearchResultsProps = {
  searchResults: Business[] | null
}

export const SearchResults = ({ searchResults }: SearchResultsProps) => {
  return (
    <>
      <ScrollXWrapper
        disableScroll={
          searchResults && searchResults?.length <= 0 ? true : false
        }
      >
        {searchResults && searchResults?.length > 0
          ? searchResults.map((result, index) => {
              console.log(result)

              // convert meters to miles
              const miles = (result.distance * 0.000621371192).toFixed(2)
              // round to 2 decimal places

              return (
                <ResultTile
                  key={index}
                  uid={result.alias}
                  href={result.url}
                  className="!p-0"
                >
                  <div
                    className={clsx(
                      "md:py-7 py-5 md:px-9 px-6",
                      "z-[-1] w-full h-48 relative mix-blend-multiply",
                    )}
                  >
                    <h2 className="text-primary text-2xl">{result.name}</h2>
                    <div
                      className={clsx(
                        "bg-secondary",
                        "absolute inset-0 z-[-1]",
                      )}
                    >
                      <div
                        className={clsx(
                          "absolute inset-0 ",
                          "bg-secondary mix-blend-hard-light",
                        )}
                      />
                      <Image
                        className={clsx(
                          "absolute inset-1 z-[-2]",
                          "mix-blend-screen",
                        )}
                        src={result.image_url}
                        alt={result.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        objectFit="cover"
                      />
                    </div>
                  </div>
                  <div className="md:py-7 py-5 md:px-9 px-6 ">
                    <p>
                      {result.location.display_address.map((item, i) => (
                        <span key={i}>{item} </span>
                      ))}
                    </p>
                    <p>{result.rating} Stars</p>
                    <p>{result.review_count} Reviews</p>
                    <p>{miles} miles</p>
                    {result.buentag && <p>{result.buentag}</p>}
                  </div>
                </ResultTile>
              )
            })
          : ["", "", ""].map((_, index) => <ResultTile key={index} />)}
      </ScrollXWrapper>
    </>
  )
}
