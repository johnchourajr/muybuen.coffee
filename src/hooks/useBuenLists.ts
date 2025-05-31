import { Buen_lists } from "@/types/buen_lists";
import { useRetoolDatabase } from "@muybuen/retool-db-react";
import { useCallback, useMemo, useState } from "react";

export interface BuenListEntry {
  alias: string;
  list: "buenlist" | "shitlist" | "blacklist";
}

export interface BuenListsData {
  entries: Buen_lists[];
  entriesByAlias: Record<string, Buen_lists>;
  entriesByList: Record<"buenlist" | "shitlist" | "blacklist", Buen_lists[]>;
}

export const useBuenLists = (aliases?: string[]) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Query for entries - either all entries or filtered by aliases
  const entriesQuery = useMemo(() => {
    if (aliases && aliases.length > 0) {
      // Filter by specific aliases
      const placeholders = aliases
        .map((_, index) => `$${index + 1}`)
        .join(", ");
      return {
        query: `SELECT * FROM buen_lists WHERE alias IN (${placeholders}) ORDER BY created DESC`,
        params: aliases.slice(),
      };
    } else {
      // Get all entries
      return {
        query: "SELECT * FROM buen_lists ORDER BY created DESC",
        params: [],
      };
    }
  }, [aliases]);

  const {
    data: entriesData,
    isLoading,
    error,
    insert,
    update,
    remove,
    refetch,
  } = useRetoolDatabase<Buen_lists>("buen_lists", entriesQuery);

  // Process the data into a more usable format
  const buenListsData = useMemo((): BuenListsData => {
    const entries = entriesData || [];

    // Create a map by alias for quick lookups
    const entriesByAlias: Record<string, Buen_lists> = {};
    entries.forEach((entry) => {
      if (entry.alias) {
        entriesByAlias[entry.alias] = entry;
      }
    });

    // Group by list type
    const entriesByList: Record<
      "buenlist" | "shitlist" | "blacklist",
      Buen_lists[]
    > = {
      buenlist: [],
      shitlist: [],
      blacklist: [],
    };

    entries.forEach((entry) => {
      if (entry.list && entry.alias) {
        entriesByList[entry.list].push(entry);
      }
    });

    return {
      entries,
      entriesByAlias,
      entriesByList,
    };
  }, [entriesData]);

  // Add or update an entry
  const addToList = useCallback(
    async (alias: string, listType: "buenlist" | "shitlist" | "blacklist") => {
      if (isSubmitting || !alias) {
        console.log("Add to list prevented:", { isSubmitting, alias });
        return;
      }

      console.log("Adding to list:", { alias, listType });
      setIsSubmitting(true);

      try {
        const existingEntry = buenListsData.entriesByAlias[alias];

        if (existingEntry) {
          if (existingEntry.list === listType) {
            // Same list type - remove the entry (toggle off)
            console.log("Removing from list:", existingEntry.id);
            await remove({ id: existingEntry.id });
          } else {
            // Different list type - update the entry
            console.log(
              "Updating list entry:",
              existingEntry.id,
              "to",
              listType,
            );
            await update(
              { id: existingEntry.id },
              {
                list: listType,
              },
            );
          }
        } else {
          // No existing entry - create new entry
          console.log("Creating new list entry:", { alias, listType });
          await insert({
            alias,
            list: listType,
            created: new Date(),
          });
        }

        // Refetch data to get updated results
        console.log("Refetching list data...");
        await refetch();
        console.log("List update completed successfully");
      } catch (err) {
        console.error("Error updating list:", err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      buenListsData.entriesByAlias,
      isSubmitting,
      insert,
      update,
      remove,
      refetch,
    ],
  );

  // Remove an entry from any list
  const removeFromList = useCallback(
    async (alias: string) => {
      if (isSubmitting || !alias) {
        console.log("Remove from list prevented:", { isSubmitting, alias });
        return;
      }

      console.log("Removing from list:", { alias });
      setIsSubmitting(true);

      try {
        const existingEntry = buenListsData.entriesByAlias[alias];

        if (existingEntry) {
          console.log("Removing list entry:", existingEntry.id);
          await remove({ id: existingEntry.id });

          // Refetch data to get updated results
          console.log("Refetching list data...");
          await refetch();
          console.log("List removal completed successfully");
        } else {
          console.log("No entry found to remove for alias:", alias);
        }
      } catch (err) {
        console.error("Error removing from list:", err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [buenListsData.entriesByAlias, isSubmitting, remove, refetch],
  );

  // Convenience methods for specific list types
  const addToBuenList = useCallback(
    (alias: string) => addToList(alias, "buenlist"),
    [addToList],
  );

  const addToShitList = useCallback(
    (alias: string) => addToList(alias, "shitlist"),
    [addToList],
  );

  const addToBlackList = useCallback(
    (alias: string) => addToList(alias, "blacklist"),
    [addToList],
  );

  // Check if an alias is in a specific list
  const isInList = useCallback(
    (
      alias: string,
      listType: "buenlist" | "shitlist" | "blacklist",
    ): boolean => {
      const entry = buenListsData.entriesByAlias[alias];
      return entry?.list === listType;
    },
    [buenListsData.entriesByAlias],
  );

  // Get the current list for an alias
  const getCurrentList = useCallback(
    (alias: string): "buenlist" | "shitlist" | "blacklist" | null => {
      const entry = buenListsData.entriesByAlias[alias];
      return entry?.list || null;
    },
    [buenListsData.entriesByAlias],
  );

  return {
    // Data
    ...buenListsData,

    // State
    isLoading,
    isSubmitting,
    error,

    // Actions
    addToList,
    addToBuenList,
    addToShitList,
    addToBlackList,
    removeFromList,
    refetch,

    // Utilities
    isInList,
    getCurrentList,
  };
};
