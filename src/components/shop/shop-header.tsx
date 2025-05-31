"use client";
import { AnimatePresence, motion } from "motion/react";
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
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-3"
    >
      <div className="flex items-start justify-between">
        <h1 className="text-buen-2xl font-bold text-primary pr-4 text-pretty">
          {name}
        </h1>
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
          <AnimatePresence>
            {shopListInfo.badge && (
              <motion.div
                key="shop-list-badge"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                layoutId={shopListInfo.badge.label}
              >
                <StatusBadge
                  variant={shopListInfo.badge.variant}
                  label={shopListInfo.badge.label}
                  icon={shopListInfo.badge.icon}
                />
              </motion.div>
            )}
            {isClaimed && (
              <motion.div
                key="verified-badge"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                layoutId={"verified-badge"}
              >
                <StatusBadge variant="verified" label="Verified" icon="✓" />
              </motion.div>
            )}
            {isOpenNow !== undefined && (
              <motion.div
                key="openclosed-badge"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                layoutId={"openclosed-badge"}
              >
                <StatusBadge
                  variant={isOpenNow ? "open" : "closed"}
                  label={isOpenNow ? "Open" : "Closed"}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
