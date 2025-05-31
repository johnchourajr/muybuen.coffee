"use client";
import { useBuenLists } from "@/hooks/useBuenLists";
import { motion } from "motion/react";
import { useMemo } from "react";

interface ListManagementDevToolsProps {
  shopAlias: string;
  className?: string;
}

export const ListManagementDevTools = ({
  shopAlias,
  className,
}: ListManagementDevToolsProps) => {
  // Memoize the aliases array to prevent recreating it on every render
  const aliases = useMemo(() => [shopAlias], [shopAlias]);

  // Use the hook to get shop list data and actions
  const {
    addToBuenList,
    addToShitList,
    addToBlackList,
    removeFromList,
    getCurrentList,
    isInList,
    isSubmitting,
  } = useBuenLists(aliases);

  // Don't render anything if not on localhost
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  const currentList = getCurrentList(shopAlias);

  return (
    <motion.div
      initial={{ opacity: 0, y: "1rem" }}
      animate={{ opacity: 1, y: "0rem" }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`bg-primary/5 border border-primary/25 rounded-lg p-4 ${className || ""}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-primary">
          Dev Tools - List Management
        </h3>
        {currentList && (
          <span className="text-xs px-2 py-1 rounded">
            Currently: {currentList}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => addToBuenList(shopAlias)}
          disabled={isSubmitting}
          className={`px-3 py-1 text-xs rounded transition-colors ${
            isInList(shopAlias, "buenlist")
              ? "bg-primary text-white hover:bg-primary/80"
              : "bg-primary/10 text-primary hover:bg-primary/20"
          } disabled:opacity-50`}
        >
          {isInList(shopAlias, "buenlist") ? "Remove from Buen" : "Add to Buen"}
        </button>

        <button
          onClick={() => addToShitList(shopAlias)}
          disabled={isSubmitting}
          className={`px-3 py-1 text-xs rounded transition-colors ${
            isInList(shopAlias, "shitlist")
              ? "bg-red/10 text-red hover:bg-red/20"
              : "bg-red/10 text-red hover:bg-red/20"
          } disabled:opacity-50`}
        >
          {isInList(shopAlias, "shitlist") ? "Remove from Shit" : "Add to Shit"}
        </button>

        <button
          onClick={() => addToBlackList(shopAlias)}
          disabled={isSubmitting}
          className={`px-3 py-1 text-xs rounded transition-colors ${
            isInList(shopAlias, "blacklist")
              ? "bg-black/10 text-black hover:bg-black/20"
              : "bg-black/10 text-black hover:bg-black/20"
          } disabled:opacity-50`}
        >
          {isInList(shopAlias, "blacklist")
            ? "Remove from Blacklist"
            : "Add to Blacklist"}
        </button>

        {currentList && (
          <button
            onClick={() => removeFromList(shopAlias)}
            disabled={isSubmitting}
            className="px-3 py-1 text-xs rounded bg-gray-300 text-gray-800 hover:bg-gray-400 transition-colors disabled:opacity-50"
          >
            Remove from All
          </button>
        )}
      </div>

      {isSubmitting && (
        <p className="text-xs text-yellow-700 mt-2">Updating lists...</p>
      )}
    </motion.div>
  );
};
