"use client";
import { VoteTally } from "@/hooks/useVoteTallies";
import { ScoredBusiness } from "@/lib/coffee-shop-scoring";
import { ShopListInfo } from "@/utils/shop-lists";
import clsx from "clsx";
import Image from "next/image";
import { BusinessInfo } from "./business-info";
import { RatingDisplay } from "./rating-display";
import { ScoringDisplay } from "./scoring-display";
import { StatusBadge } from "./status-badge";
import { VoteTallyDisplay } from "./vote-tally-display";

export interface BusinessCardContentProps {
  name: string;
  rating: number;
  reviewCount: number;
  address?: string[];
  distance?: string;
  imageUrl?: string;
  imageAlt?: string;
  buentag?: string;
  shopAlias?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showImage?: boolean;
  showListBadge?: boolean;
  voteTally?: VoteTally;
  showVoteTally?: boolean;
  business?: ScoredBusiness;
  showScoring?: boolean;
  showScoringBreakdown?: boolean;
  listStatus?: ShopListInfo;
}

export const BusinessCardContent = ({
  name,
  rating,
  reviewCount,
  address,
  distance,
  imageUrl,
  imageAlt,
  buentag,
  shopAlias,
  className,
  size = "md",
  showImage = true,
  showListBadge = true,
  voteTally,
  showVoteTally = true,
  business,
  showScoring = false,
  showScoringBreakdown = false,
  listStatus,
}: BusinessCardContentProps) => {
  const sizeClasses = {
    sm: {
      title: "text-lg",
      padding: "md:py-4 py-3 md:px-6 px-4",
      imageHeight: "h-32",
    },
    md: {
      title: "text-xl md:text-2xl",
      padding: "md:py-7 py-5 md:px-9 px-6",
      imageHeight: "h-48",
    },
    lg: {
      title: "text-2xl md:text-3xl",
      padding: "md:py-8 py-6 md:px-10 px-7",
      imageHeight: "h-64",
    },
  };

  const currentSize = sizeClasses[size];

  const shopListInfo = listStatus || { status: null };

  const businessInfoItems = [
    ...(distance ? [{ label: "", value: distance }] : []),
  ];

  return (
    <div className={clsx("flex flex-col h-full", className)}>
      {/* Header with image */}
      {showImage && imageUrl && (
        <div
          className={clsx(
            currentSize.padding,
            "z-[-1] w-full relative mix-blend-multiply",
            currentSize.imageHeight,
          )}
        >
          <div className="flex flex-col gap-2 items-start justify-between mb-2">
            <h2 className={clsx("text-primary flex-1", currentSize.title)}>
              {name}
            </h2>
            {showListBadge && shopListInfo.badge && (
              <StatusBadge
                variant={shopListInfo.badge.variant}
                label={shopListInfo.badge.label}
                icon={shopListInfo.badge.icon}
                className="w-fit"
              />
            )}
          </div>
          <div className={clsx("bg-secondary", "absolute inset-0 z-[-1]")}>
            <div
              className={clsx(
                "absolute inset-0 bg-secondary mix-blend-hard-light",
              )}
            />
            <Image
              className={clsx(
                "absolute inset-0 w-full h-full object-cover z-[-2] mix-blend-screen",
              )}
              src={imageUrl}
              alt={imageAlt || name}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              width={256}
              height={256}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className={clsx(currentSize.padding, "flex-1 flex flex-col gap-2")}>
        {!showImage && (
          <div className="flex items-start justify-between mb-3">
            <h2 className={clsx("text-primary flex-1", currentSize.title)}>
              {name}
            </h2>
            {showListBadge && shopListInfo.badge && (
              <StatusBadge
                variant={shopListInfo.badge.variant}
                label={shopListInfo.badge.label}
                icon={shopListInfo.badge.icon}
                className="ml-2 flex-shrink-0"
              />
            )}
          </div>
        )}

        {address && (
          <p className="">
            {address.map((item, i) => (
              <span key={i}>{item} </span>
            ))}
          </p>
        )}

        <div className="space-y-2">
          <RatingDisplay
            rating={rating}
            reviewCount={reviewCount}
            size={size === "sm" ? "sm" : "md"}
          />

          {businessInfoItems.length > 0 && (
            <BusinessInfo items={businessInfoItems} orientation="vertical" />
          )}
        </div>

        {/* Scoring Display */}
        {showScoring && business && (
          <ScoringDisplay
            business={business}
            showBreakdown={showScoringBreakdown}
            size={size === "lg" ? "md" : "sm"}
            className="mt-2"
          />
        )}

        <VoteTallyDisplay tally={voteTally} size="sm" className="mt-2" />
      </div>
    </div>
  );
};
