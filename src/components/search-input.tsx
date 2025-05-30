"use client";

// components/SearchInput.tsx
import { AppContext } from "@/contexts/appContext";
import { apiUrls } from "@/lib/url-utils";
import clsx from "clsx";
import debounce from "lodash.debounce";
import { AnimatePresence, motion, useWillChange } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useContext, useEffect, useState } from "react";

export const dynamic = "force-dynamic";

type Prediction = {
  description: string;
};

type SearchFormProps = {
  onSearch: (location: string) => void;
  number?: number;
};

const SearchInput = ({ onSearch, number }: SearchFormProps) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const willChange = useWillChange();

  const [input, setInput] = useState<string>("");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);

  const router = useRouter();
  const query = useSearchParams();
  const param = query.get("find");
  const { searchResults } = useContext(AppContext);

  useEffect(() => {
    const findParam = param as string;
    if (findParam) {
      setInput(findParam);
      onSearch(findParam);
    }
  }, []);

  const fetchPredictions = async (inputValue: string) => {
    try {
      const response = await fetch(
        apiUrls.search.googleAutocomplete(inputValue),
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setPredictions(data.data.predictions);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      }
      setPredictions([]);
    }
  };

  const debouncedFetchPredictions = useCallback(
    debounce(fetchPredictions, 300),
    [],
  );

  useEffect(() => {
    if (input.length >= 3) {
      debouncedFetchPredictions(input);
    } else {
      setPredictions([]);
    }

    return () => {
      debouncedFetchPredictions.cancel();
    };
  }, [input, debouncedFetchPredictions]);

  const handlePredictionSelect = (prediction: Prediction) => {
    setInput(prediction.description);
    setPredictions([]);
    setIsInputFocused(false); // Remove focus when a prediction is selected
    router.push(`/?find=${encodeURIComponent(prediction.description)}`);
    onSearch(prediction.description);
  };

  const handleWrapperBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!ref?.current?.contains(event.relatedTarget)) {
      setIsInputFocused(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
    setIsInputFocused(true);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent the default action for Enter key
      if (predictions.length > 0) {
        // If there are predictions, select the first one
        handlePredictionSelect(predictions[0]);
      } else {
        // Otherwise, directly use the input for search
        router.push(`/?find=${encodeURIComponent(input)}`);
        onSearch(input);
        setIsInputFocused(false); // Optionally, remove focus from the input
      }
    }
    if (event.key === "Escape") {
      setIsInputFocused(false);
    }
  };

  return (
    <motion.div
      ref={ref}
      onBlur={handleWrapperBlur}
      className="relative w-full bg-white rounded-md "
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.7, type: "spring" }}
      style={{ willChange }}
    >
      <AnimatePresence>
        {searchResults && searchResults?.length > 0 && (
          <motion.div className="absolute text-xs right-0 h-full flex items-center px-4 opacity-50">
            <p className="">{number} results</p>
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
          "w-full p-3 px-5 pr-24 border-0 focus:ring-0 focus:outline-none text-xl bg-[transparent]",
          "placeholder:text-tertiary",
        )}
        autoFocus={!searchResults || searchResults?.length === 0}
      />
      <AnimatePresence>
        {isInputFocused && predictions.length > 0 && (
          <motion.div
            className={clsx(
              "absolute w-full top-14 left-0 max-h-32 h-auto overflow-scroll bg-white rounded-md",
            )}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ willChange }}
          >
            {predictions.map((sugg: any, index) => (
              <motion.button
                key={index}
                className={clsx(
                  "px-5 py-2 cursor-pointer text-start w-full",
                  "focus:outline-none focus:ring-0 focus:bg-primary focus:bg-opacity-5",
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
