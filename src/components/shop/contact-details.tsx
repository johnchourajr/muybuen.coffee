"use client";

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
}: ContactDetailsProps) => {
  return (
    <div className="space-y-6">
      {/* Categories */}
      {categories && categories.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-primary mb-2">
            Categories
          </h3>
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
      <div>
        <h3 className="text-lg font-semibold text-primary mb-2">Location</h3>
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
        <div>
          <h3 className="text-lg font-semibold text-primary mb-1">Phone</h3>
          <a
            href={`tel:${phone}`}
            className="text-primary/80 hover:text-primary transition-colors"
          >
            {displayPhone}
          </a>
        </div>
      )}

      {price && (
        <div>
          <h3 className="text-lg font-semibold text-primary mb-1">
            Price Range
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-primary/80 font-medium">{price}</span>
            <span className="text-primary/60 text-sm">
              ({getPriceExplanation(price)})
            </span>
          </div>
        </div>
      )}

      {transactions && transactions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-primary mb-1">
            Transactions
          </h3>
          {/* Services badges */}
          <ServicesBadges transactions={transactions} />
        </div>
      )}
    </div>
  );
};
