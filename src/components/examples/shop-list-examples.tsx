"use client"
import { BusinessCardContent, StatusBadge, getShopListStatus } from "../ui"

/**
 * Examples of how to use the shop list features
 */
export const ShopListExamples = () => {
  // Example shop aliases from your lists
  const buenShop = "neat-coffee-costa-mesa" // From buenlist
  const shitShop = "rad-coffee-long-beach-4" // From shitlist
  const regularShop = "some-regular-shop" // Not on any list

  return (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-bold mb-4">Shop List Badge Examples</h2>

      {/* Individual badge examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Individual Badges:</h3>
        <div className="flex gap-4">
          <StatusBadge variant="buen" label="Buen Listed" icon="✨" />
          <StatusBadge variant="shit" label="Shit Listed" icon="💩" />
        </div>
      </div>

      {/* Programmatic badge examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Programmatic Examples:</h3>
        <div className="space-y-2">
          {[buenShop, shitShop, regularShop].map((alias) => {
            const shopInfo = getShopListStatus(alias)
            return (
              <div key={alias} className="flex items-center gap-4">
                <span className="w-48 text-sm font-mono">{alias}</span>
                <span className="w-20">{shopInfo.status || "regular"}</span>
                {shopInfo.badge && (
                  <StatusBadge
                    variant={shopInfo.badge.variant}
                    label={shopInfo.badge.label}
                    icon={shopInfo.badge.icon}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Business card examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Business Card Examples:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Buen listed shop */}
          <div className="bg-white rounded-lg p-4">
            <BusinessCardContent
              name="Neat Coffee"
              rating={4.8}
              reviewCount={156}
              address={["123 Main St", "Costa Mesa, CA"]}
              distance="0.5 miles"
              shopAlias="neat-coffee-costa-mesa"
              showImage={false}
              size="sm"
            />
          </div>

          {/* Shit listed shop */}
          <div className="bg-white rounded-lg p-4">
            <BusinessCardContent
              name="Rad Coffee"
              rating={3.2}
              reviewCount={89}
              address={["456 Beach Blvd", "Long Beach, CA"]}
              distance="2.1 miles"
              shopAlias="rad-coffee-long-beach-4"
              showImage={false}
              size="sm"
            />
          </div>

          {/* Regular shop */}
          <div className="bg-white rounded-lg p-4">
            <BusinessCardContent
              name="Regular Coffee"
              rating={4.0}
              reviewCount={45}
              address={["789 Oak Ave", "Somewhere, CA"]}
              distance="1.2 miles"
              shopAlias="some-regular-shop"
              showImage={false}
              size="sm"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
