"use client";
import { useBuenLists } from "@/hooks/useBuenLists";
import { BusinessCardContent, StatusBadge, clientSideUtils } from "../ui";

// Mock vote tallies for testing
const mockVoteTallies = {
  "neat-coffee-costa-mesa": {
    alias: "neat-coffee-costa-mesa",
    upvotes: 8,
    downvotes: 2,
    totalVotes: 10,
  },
  "rad-coffee-long-beach-4": {
    alias: "rad-coffee-long-beach-4",
    upvotes: 3,
    downvotes: 7,
    totalVotes: 10,
  },
  "some-regular-shop": {
    alias: "some-regular-shop",
    upvotes: 5,
    downvotes: 5,
    totalVotes: 10,
  },
};

/**
 * Examples of how to use the shop list features with database-backed lists
 */
export const ShopListExamples = () => {
  // Use the database-backed hook
  const {
    entriesByAlias,
    isLoading,
    addToBuenList,
    addToShitList,
    removeFromList,
    isInList,
    getCurrentList,
  } = useBuenLists();

  // Example shop aliases for testing
  const testAliases = [
    "neat-coffee-costa-mesa",
    "rad-coffee-long-beach-4",
    "some-regular-shop",
  ];

  if (isLoading) {
    return <div className="p-8">Loading shop lists...</div>;
  }

  return (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-bold mb-4">
        Shop List Badge Examples (Database-Backed)
      </h2>

      {/* Individual badge examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Individual Badges:</h3>
        <div className="flex gap-4">
          <StatusBadge variant="buen" label="Buen Listed" icon="✨" />
          <StatusBadge variant="shit" label="Shit Listed" icon="💩" />
        </div>
      </div>

      {/* Database-backed examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Database-Backed Examples:</h3>
        <div className="space-y-4">
          {testAliases.map((alias) => {
            const shopInfo = clientSideUtils.getShopListStatus(
              alias,
              entriesByAlias,
            );
            const currentList = getCurrentList(alias);

            return (
              <div key={alias} className="border rounded p-4">
                <div className="flex items-center gap-4 mb-2">
                  <span className="w-48 text-sm font-mono">{alias}</span>
                  <span className="w-20">{shopInfo.status || "regular"}</span>
                  {shopInfo.badge && (
                    <StatusBadge
                      variant={shopInfo.badge.variant}
                      label={shopInfo.badge.label}
                      icon={shopInfo.badge.icon}
                    />
                  )}
                  <span className="text-xs text-gray-500">
                    Current: {currentList || "none"}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => addToBuenList(alias)}
                    className={`px-3 py-1 text-xs rounded ${
                      isInList(alias, "buenlist")
                        ? "bg-green-200 text-green-800"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {isInList(alias, "buenlist")
                      ? "Remove from Buen"
                      : "Add to Buen"}
                  </button>

                  <button
                    onClick={() => addToShitList(alias)}
                    className={`px-3 py-1 text-xs rounded ${
                      isInList(alias, "shitlist")
                        ? "bg-red-200 text-red-800"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {isInList(alias, "shitlist")
                      ? "Remove from Shit"
                      : "Add to Shit"}
                  </button>

                  {currentList && (
                    <button
                      onClick={() => removeFromList(alias)}
                      className="px-3 py-1 text-xs rounded bg-gray-300 text-gray-800"
                    >
                      Remove from All
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Usage code examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Code Examples:</h3>
        <div className="bg-gray-100 p-4 rounded text-sm font-mono">
          <pre>{`// Using the hook
const { entriesByAlias, addToBuenList, isInList } = useBuenLists();

// Check if shop is in a list
const isBuen = isInList('shop-alias', 'buenlist');

// Add to list (with toggle behavior)
await addToBuenList('shop-alias');

// Get shop status with badge info
const shopInfo = clientSideUtils.getShopListStatus('shop-alias', entriesByAlias);`}</pre>
        </div>
      </div>

      {/* Business card examples with real data */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Business Card Integration:</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {testAliases.slice(0, 2).map((alias) => {
            const shopInfo = clientSideUtils.getShopListStatus(
              alias,
              entriesByAlias,
            );
            const voteTally =
              mockVoteTallies[alias as keyof typeof mockVoteTallies];

            return (
              <div key={alias} className="border rounded-lg overflow-hidden">
                <BusinessCardContent
                  name={alias
                    .split("-")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ")}
                  rating={4.2}
                  reviewCount={150}
                  address={["123 Coffee St", "Costa Mesa, CA"]}
                  distance="0.5 miles"
                  imageUrl="/placeholder-coffee-shop.jpg"
                  imageAlt="Coffee shop"
                  shopAlias={alias}
                  size="md"
                  showImage={true}
                  showListBadge={true}
                  voteTally={voteTally}
                  showVoteTally={true}
                  listStatus={shopInfo}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
