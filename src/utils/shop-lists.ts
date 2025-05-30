import { buenlist } from "@/data/lists/buenlist"
import { shitlist } from "@/data/lists/shitlist"

export type ShopListStatus = "buen" | "shit" | null

export interface ShopListInfo {
  status: ShopListStatus
  badge?: {
    variant: "buen" | "shit"
    label: string
    icon: string
  }
}

/**
 * Check if a shop is on the buen list or shit list
 * @param shopAlias - The shop's alias/identifier
 * @returns ShopListInfo object with status and badge information
 */
export const getShopListStatus = (shopAlias: string): ShopListInfo => {
  if (buenlist.includes(shopAlias)) {
    return {
      status: "buen",
      badge: {
        variant: "buen",
        label: "Buen",
        icon: "👍",
      },
    }
  }

  if (shitlist.includes(shopAlias)) {
    return {
      status: "shit",
      badge: {
        variant: "shit",
        label: "Shit",
        icon: "💩",
      },
    }
  }

  return { status: null }
}

/**
 * Check if a shop is on the buen list
 */
export const isBuenListed = (shopAlias: string): boolean => {
  return buenlist.includes(shopAlias)
}

/**
 * Check if a shop is on the shit list
 */
export const isShitListed = (shopAlias: string): boolean => {
  return shitlist.includes(shopAlias)
}
