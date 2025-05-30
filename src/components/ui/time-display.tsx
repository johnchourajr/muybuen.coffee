"use client"
import clsx from "clsx"

export interface TimeDisplayProps {
  start?: string
  end?: string
  format?: "12h" | "24h"
  separator?: string
  className?: string
  showLabel?: boolean
  label?: string
}

const formatTime = (time: string, format: "12h" | "24h" = "12h") => {
  if (format === "24h") return time

  const hour = parseInt(time.substring(0, 2))
  const minute = time.substring(2, 4)
  const ampm = hour >= 12 ? "PM" : "AM"
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minute} ${ampm}`
}

export const TimeDisplay = ({
  start,
  end,
  format = "12h",
  separator = " - ",
  className,
  showLabel = false,
  label = "Hours",
}: TimeDisplayProps) => {
  if (!start && !end) return null

  const formattedStart = start ? formatTime(start, format) : ""
  const formattedEnd = end ? formatTime(end, format) : ""

  const timeString =
    formattedStart && formattedEnd
      ? `${formattedStart}${separator}${formattedEnd}`
      : formattedStart || formattedEnd

  return (
    <span className={clsx("text-nowrap", className)}>
      {showLabel && label && <span className="mr-1">{label}:</span>}
      {timeString}
    </span>
  )
}
