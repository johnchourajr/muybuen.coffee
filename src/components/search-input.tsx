// components/SearchInput.tsx
import clsx from "clsx"
import React, { useState, useEffect, useCallback } from "react"
import { AnimatePresence, motion, useWillChange } from "framer-motion"
import { useSearchParams, useRouter } from "next/navigation"
import debounce from "lodash.debounce"
import { AppContext } from "@/contexts/appContext"

export const dynamic = "force-dynamic"

type Prediction = {
  description: string
}

type SearchFormProps = {
  onSearch: (location: string) => void
}

const SearchInput = ({ onSearch }: SearchFormProps) => {
  const ref = React.useRef<HTMLDivElement>(null)
  const {
    apiEnabledAutoComplete,
    setApiEnabledAutoComplete,
    apiCountAutocomplete,
    setApiCountAutocomplete,
  } = React.useContext(AppContext)
  const willChange = useWillChange()

  const [input, setInput] = useState<string>("")
  const [apiEnabled, setApiEnabled] = useState<boolean>(true)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false)

  const router = useRouter()
  const query = useSearchParams()
  const param = query.get("find")

  useEffect(() => {
    const findParam = param as string
    if (findParam) {
      setInput(findParam)
      onSearch(findParam)
    }
  }, [])

  const fetchPredictions = async (inputValue: string) => {
    if (!apiEnabled) return
    try {
      const response = await fetch(
        `/api/search/googleautocomplete?input=${encodeURIComponent(
          inputValue,
        )}`,
      )
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }
      const data = await response.json()
      setPredictions(data.data.predictions)
      setApiCountAutocomplete(apiCountAutocomplete + 1)
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message)
      }
      setPredictions([])
    }
  }

  const debouncedFetchPredictions = useCallback(
    debounce(fetchPredictions, 300),
    [],
  )

  useEffect(() => {
    if (input.length >= 3) {
      debouncedFetchPredictions(input)
    } else {
      setPredictions([])
    }

    return () => {
      debouncedFetchPredictions.cancel()
    }
  }, [input, debouncedFetchPredictions])

  const handlePredictionSelect = (prediction: Prediction) => {
    setInput(prediction.description)
    setPredictions([])
    setIsInputFocused(false) // Remove focus when a prediction is selected
    router.push(`/?find=${encodeURIComponent(prediction.description)}`)
    onSearch(prediction.description)
  }

  const handleWrapperBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!ref?.current?.contains(event.relatedTarget)) {
      setIsInputFocused(false)
    }
  }

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
      <motion.input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onFocus={() => setIsInputFocused(true)}
        placeholder="Enter a location"
        className={clsx(
          "w-full p-3 px-5 border-0 focus:ring-0 focus:outline-none text-xl bg-[transparent]",
          "placeholder:text-tertiary",
        )}
        autoFocus
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
  )
}

export default SearchInput
