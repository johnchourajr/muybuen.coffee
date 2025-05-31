"use client";

// components/SearchInput.tsx
import { AppContext } from "@/contexts/appContext";
import { useGoogleAutocomplete } from "@/hooks/useSearchQueries";
import clsx from "clsx";
import { AnimatePresence, motion, useWillChange } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";

export const dynamic = "force-dynamic";

type Prediction = {
  description: string;
};

type SearchFormProps = {
  onSearch: (location: string) => void;
  number?: number;
  isLoading?: boolean;
};

const SearchInput = ({ onSearch, number, isLoading }: SearchFormProps) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const suggestionRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const willChange = useWillChange();

  const [input, setInput] = useState<string>("");
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const [debouncedInput, setDebouncedInput] = useState<string>("");
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const router = useRouter();
  const query = useSearchParams();
  const param = query.get("find");
  const { searchResults } = useContext(AppContext);

  // Simple debouncing with useEffect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInput(input);
    }, 300);

    return () => clearTimeout(timer);
  }, [input]);

  // Use React Query for autocomplete with caching
  const { data: predictions = [], isLoading: autocompleteLoading } =
    useGoogleAutocomplete(debouncedInput, {
      enabled: !!debouncedInput && debouncedInput.length >= 2 && isInputFocused,
    });

  // Update suggestion refs array when predictions change
  useEffect(() => {
    suggestionRefs.current = suggestionRefs.current.slice(
      0,
      predictions.length,
    );
  }, [predictions.length]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionRefs.current[selectedIndex]) {
      suggestionRefs.current[selectedIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedIndex]);

  useEffect(() => {
    const findParam = param as string;
    if (findParam) {
      setInput(findParam);
      onSearch(findParam);
    }
  }, [onSearch, param]);

  const handlePredictionSelect = (prediction: Prediction) => {
    setInput(prediction.description);
    setIsInputFocused(false); // Remove focus when a prediction is selected
    setSelectedIndex(-1); // Reset selected index
    router.push(`/?find=${encodeURIComponent(prediction.description)}`);
    onSearch(prediction.description);
  };

  const handleWrapperBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!ref?.current?.contains(event.relatedTarget)) {
      setIsInputFocused(false);
      setSelectedIndex(-1); // Reset selected index when losing focus
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
    setIsInputFocused(true);
    setSelectedIndex(-1); // Reset selected index when input changes
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent the default action for Enter key
      if (predictions.length > 0) {
        // If there are predictions, select the highlighted one or the first one
        const indexToSelect = selectedIndex >= 0 ? selectedIndex : 0;
        handlePredictionSelect(predictions[indexToSelect]);
      } else {
        // Otherwise, directly use the input for search
        router.push(`/?find=${encodeURIComponent(input)}`);
        onSearch(input);
        setIsInputFocused(false); // Optionally, remove focus from the input
      }
    }
    if (event.key === "Escape") {
      setIsInputFocused(false);
      setSelectedIndex(-1); // Reset selected index
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (predictions.length > 0) {
        setSelectedIndex((prevIndex) =>
          prevIndex < predictions.length - 1 ? prevIndex + 1 : 0,
        );
      }
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (predictions.length > 0) {
        setSelectedIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : predictions.length - 1,
        );
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      onBlur={handleWrapperBlur}
      className="relative w-full bg-white rounded-md"
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.7, type: "spring" }}
      style={{ willChange }}
    >
      <AnimatePresence>
        {searchResults && searchResults?.length > 0 && (
          <motion.div
            key="results-number"
            className="absolute text-xs right-0 h-full flex items-center px-4 opacity-50"
          >
            <p className="">{number} results</p>
          </motion.div>
        )}

        {/* Loading indicator for search */}
        {isLoading && (
          <motion.div
            key="loading-indicator"
            className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-200 overflow-hidden"
          >
            <motion.div
              className="h-full w-1/3 bg-primary/60"
              initial={{ x: "-100%" }}
              animate={{ x: "300%" }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.input
        type="text"
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsInputFocused(true)}
        placeholder="Enter a location"
        className={clsx(
          "w-full p-3 pr-24 border-0 focus:ring-0 focus:outline-none text-xl bg-[transparent]",
          "placeholder:text-tertiary",
          "px-5",
        )}
        autoFocus={!searchResults || searchResults?.length === 0}
      />

      <AnimatePresence>
        {isInputFocused && predictions.length > 0 && (
          <motion.div
            className={clsx(
              "absolute w-full top-14 left-0 max-h-32 h-auto overflow-scroll bg-white rounded-md shadow-lg border z-10",
            )}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ willChange }}
          >
            {autocompleteLoading && (
              <div className="px-5 py-2 text-gray-500 text-sm">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                  Loading suggestions...
                </div>
              </div>
            )}
            {predictions.map((sugg: Prediction, index: number) => (
              <motion.button
                key={index}
                ref={(el) => {
                  suggestionRefs.current[index] = el;
                }}
                className={clsx(
                  "px-5 py-2 cursor-pointer text-start w-full hover:bg-gray-50",
                  "focus:outline-none focus:ring-0 focus:bg-primary focus:bg-opacity-5",
                  selectedIndex === index && "bg-primary bg-opacity-10",
                )}
                onClick={() => handlePredictionSelect(sugg)}
                initial={{ opacity: 1 }}
                whileHover={{ opacity: 0.75 }}
                style={{ willChange }}
              >
                {sugg?.description}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SearchInput;
