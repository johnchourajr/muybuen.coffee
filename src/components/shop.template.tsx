"use client";
import { useBuenLists } from "@/hooks/useBuenLists";
import { Business } from "@/types/search.types";
import { getShopListStatus } from "@/utils/shop-lists";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { ListManagementDevTools } from "./dev/list-management-dev-tools";
import { ContactDetails } from "./shop/contact-details";
import { PhotoCarousel } from "./shop/photo-carousel";
import { ShopActions } from "./shop/shop-actions";
import { ShopHeader } from "./shop/shop-header";

export type ShopTemplateProps = {
  shop: Business & {
    hours?: Array<{
      open: Array<{
        is_overnight: boolean;
        start: string;
        end: string;
        day: number;
      }>;
      hours_type: string;
      is_open_now?: boolean;
    }>;
    photos?: string[];
    transactions?: string[];
    is_claimed?: boolean;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    location: Business["location"] & {
      cross_streets?: string;
    };
    is_closed?: boolean;
  };
};

export const ShopTemplate = ({ shop }: ShopTemplateProps) => {
  const router = useRouter();

  // Memoize the aliases array to prevent recreating it on every render
  const aliases = useMemo(() => {
    return shop.alias ? [shop.alias] : [];
  }, [shop.alias]);

  // Use the hook to get shop list data
  const { entriesByAlias } = useBuenLists(aliases);

  // Handle distance - it might be undefined when fetching individual business details
  const miles = shop.distance
    ? (shop.distance * 0.000621371192).toFixed(2)
    : null;

  const handleBackClick = () => {
    router.back();
  };

  const photos = shop.photos || [shop.image_url];

  // Determine if shop is open now
  // First check if we have is_closed from the business data (most reliable)
  let isOpenNow: boolean | undefined;
  if (shop.is_closed !== undefined) {
    isOpenNow = !shop.is_closed;
  } else if (shop.hours?.[0]?.is_open_now !== undefined) {
    // Fallback to hours data if available
    isOpenNow = shop.hours[0].is_open_now;
  } else {
    // If neither is available, we don't show the status
    isOpenNow = undefined;
  }

  const todayHours = shop.hours?.[0]?.open?.find(
    (h) => h.day === new Date().getDay(),
  );

  // Get shop list status using client-side function with hook data
  const shopListInfo = shop.alias
    ? getShopListStatus(shop.alias, entriesByAlias)
    : { status: null };

  console.log(shopListInfo);

  return (
    <div className="min-h-screen">
      <div className="grid-container py-2 md:py-0">
        <div className="col-span-full flex flex-col gap-6">
          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, y: "1rem" }}
            animate={{ opacity: 1, y: "0rem" }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              onClick={handleBackClick}
              className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Search
            </button>
          </motion.div>

          {/* Header with status */}
          <ShopHeader
            name={shop.name}
            rating={shop.rating}
            reviewCount={shop.review_count}
            miles={miles}
            isOpenNow={isOpenNow}
            isClaimed={shop.is_claimed}
            shopListInfo={shopListInfo}
            alias={shop.alias}
            todayHours={
              todayHours
                ? {
                    start: todayHours.start,
                    end: todayHours.end,
                  }
                : null
            }
          />

          {/* Main content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image section with photo carousel */}
            <motion.div
              className="flex flex-col gap-4"
              initial={{ opacity: 0, y: "1rem" }}
              animate={{ opacity: 1, y: "0rem" }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Photo carousel */}
              <PhotoCarousel
                photos={photos}
                shopName={shop.name}
                buentag={shop.buentag as "buen" | "shitlist" | undefined}
              />

              {/* Actions */}
              <ShopActions
                yelpUrl={shop.url}
                displayAddress={shop.location.display_address}
                alias={shop.alias}
              />
            </motion.div>

            {/* Details section */}
            <motion.div
              className="flex flex-col divide-y divide-primary/10"
              initial={{ opacity: 0, y: "1rem" }}
              animate={{ opacity: 1, y: "0rem" }}
              transition={{
                duration: 0.45,
                delay: 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {/* Contact Details */}
              <ContactDetails
                categories={shop.categories}
                location={shop.location}
                phone={shop.phone}
                displayPhone={shop.display_phone}
                transactions={shop.transactions}
                price={shop.price}
                hours={shop.hours}
              />
            </motion.div>
          </div>

          {/* Dev List Management (localhost only) */}
          {shop.alias && <ListManagementDevTools shopAlias={shop.alias} />}
        </div>
      </div>
    </div>
  );
};
