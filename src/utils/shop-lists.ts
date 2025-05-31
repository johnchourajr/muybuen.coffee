export type ShopListStatus = "buen" | "shit" | null;

export interface ShopListInfo {
  status: ShopListStatus;
  badge?: {
    variant: "buen" | "shit";
    label: string;
    icon: string;
  };
}

/**
 * Client-side utilities for use with the useBuenLists hook
 * These work with the hook data and don't make database calls
 */

/**
 * Get shop list status from hook data (CLIENT-SIDE)
 */
export const getShopListStatus = (
  shopAlias: string,
  entriesByAlias: Record<string, any>,
): ShopListInfo => {
  const entry = entriesByAlias[shopAlias];

  if (entry?.list === "buenlist") {
    return {
      status: "buen",
      badge: {
        variant: "buen",
        label: "Buen",
        icon: "👍",
      },
    };
  }

  if (entry?.list === "shitlist") {
    return {
      status: "shit",
      badge: {
        variant: "shit",
        label: "Shit",
        icon: "💩",
      },
    };
  }

  return { status: null };
};

/**
 * Check if a shop is on the buen list (CLIENT-SIDE)
 */
export const isBuenListed = (
  shopAlias: string,
  entriesByAlias: Record<string, any>,
): boolean => {
  return entriesByAlias[shopAlias]?.list === "buenlist";
};

/**
 * Check if a shop is on the shit list (CLIENT-SIDE)
 */
export const isShitListed = (
  shopAlias: string,
  entriesByAlias: Record<string, any>,
): boolean => {
  return entriesByAlias[shopAlias]?.list === "shitlist";
};

// For backward compatibility, export everything under clientSideUtils as well
export const clientSideUtils = {
  getShopListStatus,
  isBuenListed,
  isShitListed,
};
