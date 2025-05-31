"use client";

import { OpeningHours } from "./opening-hours";
import { ServicesBadges } from "./services-badges";

interface ContactDetailsProps {
  categories?: Array<{
    alias: string;
    title: string;
  }>;
  location: {
    display_address: string[];
    cross_streets?: string;
  };
  phone?: string;
  displayPhone?: string;
  price?: string;
  transactions?: string[];
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
}

const getPriceExplanation = (price: string) => {
  switch (price) {
    case "$":
      return "Under $10";
    case "$$":
      return "$10 - $30";
    case "$$$":
      return "$30 - $60";
    case "$$$$":
      return "Above $60";
    default:
      return price;
  }
};

export const ContactDetails = ({
  categories,
  location,
  phone,
  displayPhone,
  price,
  transactions,
  hours,
}: ContactDetailsProps) => {
  return (
    <>
      {/* Categories */}
      {categories && categories.length > 0 && (
        <div className="pb-4 flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-primary">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm"
              >
                {category.title}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Location */}
      <div className="py-4 flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-primary">Location</h3>
        <div className="text-primary/80 space-y-1">
          {location.display_address.map((line, index) => (
            <div key={index}>{line}</div>
          ))}
          {location.cross_streets && (
            <div className="text-sm text-primary/60">
              Near {location.cross_streets}
            </div>
          )}
        </div>
      </div>

      {/* Contact & Details */}
      {displayPhone && (
        <div className="py-4 flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-primary">Phone</h3>
          <a
            href={`tel:${phone}`}
            className="text-primary/80 hover:text-primary transition-colors"
          >
            {displayPhone}
          </a>
        </div>
      )}

      {price && (
        <div className="py-4 flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-primary">Price Range</h3>
          <div className="flex items-center gap-2">
            <span className="text-primary/80 font-medium">{price}</span>
            <span className="text-primary/60 text-sm">
              ({getPriceExplanation(price)})
            </span>
          </div>
        </div>
      )}

      {transactions && transactions.length > 0 && (
        <div className="py-4 flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-primary">Transactions</h3>
          {/* Services badges */}
          <ServicesBadges transactions={transactions} />
        </div>
      )}

      {/* Opening Hours */}
      {hours && (
        <div className="py-4 flex flex-col gap-2">
          <OpeningHours hours={hours} />
        </div>
      )}
    </>
  );
};
