"use client";
import { motion } from "motion/react";
import { BusinessInfo, RatingDisplay, StatusBadge, TimeDisplay } from "../ui";

interface ShopHeaderProps {
  name: string;
  rating: number;
  reviewCount: number;
  miles?: string | null;
  isOpenNow?: boolean;
  isClaimed?: boolean;
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
  todayHours,
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
        <div className="flex items-center gap-2">
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

      <div className="flex items-center space-x-2 text-primary/80 flex-wrap">
        <RatingDisplay
          rating={rating}
          reviewCount={reviewCount}
          showReviewCount={true}
        />
        {businessInfoItems.length > 0 && (
          <BusinessInfo items={businessInfoItems} className="ml-2" />
        )}
      </div>
    </motion.div>
  );
};
