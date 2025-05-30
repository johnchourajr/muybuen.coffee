"use client";
import { motion } from "motion/react";
import {
  BusinessInfo,
  RatingDisplay,
  ShopListInfo,
  StatusBadge,
  TimeDisplay,
} from "../ui";
import { VotingButtons } from "../voting-buttons";

interface ShopHeaderProps {
  name: string;
  rating: number;
  reviewCount: number;
  miles?: string | null;
  isOpenNow?: boolean;
  isClaimed?: boolean;
  shopListInfo: ShopListInfo;
  alias?: string;
  todayHours?: {
    start: string;
    end: string;
  } | null;
}

export const ShopHeader = ({
  name,
  rating,
  reviewCount,
  miles,
  isOpenNow,
  isClaimed,
  shopListInfo,
  todayHours,
  alias,
}: ShopHeaderProps) => {
  // Prepare business info items
  const businessInfoItems = [
    ...(miles ? [{ label: "", value: `${miles} miles` }] : []),
    ...(todayHours
      ? [
          {
            label: "",
            value: (
              <TimeDisplay start={todayHours.start} end={todayHours.end} />
            ),
          },
        ]
      : []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: "1rem" }}
      animate={{ opacity: 1, y: "0rem" }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col gap-3"
    >
      <div className="flex items-start justify-between">
        <h1 className="text-4xl font-bold text-primary">{name}</h1>
        {/* Voting buttons */}
        {alias && <VotingButtons alias={alias} className="justify-center" />}
      </div>

      <div className="flex items-start gap-3 text-primary/80 flex-col">
        <div className="flex items-center space-x-2 text-primary/80 flex-wrap">
          <RatingDisplay
            rating={rating}
            reviewCount={reviewCount}
            showReviewCount={true}
          />
          <span className="text-primary/60">{"•"}</span>
          {businessInfoItems.length > 0 && (
            <BusinessInfo items={businessInfoItems} className="ml-2" />
          )}
        </div>
        <div className="flex items-center space-x-2 text-primary/80 flex-wrap">
          {shopListInfo.badge && (
            <StatusBadge
              variant={shopListInfo.badge.variant}
              label={shopListInfo.badge.label}
              icon={shopListInfo.badge.icon}
            />
          )}
          {isClaimed && (
            <StatusBadge variant="verified" label="Verified" icon="✓" />
          )}
          {isOpenNow !== undefined && (
            <StatusBadge
              variant={isOpenNow ? "open" : "closed"}
              label={isOpenNow ? "Open" : "Closed"}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};
