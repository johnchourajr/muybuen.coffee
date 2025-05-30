"use client"
import clsx from "clsx"

export interface RatingDisplayProps {
  rating: number
  reviewCount?: number
  showReviewCount?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

export const RatingDisplay = ({
  rating,
  reviewCount,
  showReviewCount = true,
  size = "md",
  className,
}: RatingDisplayProps) => {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  }

  return (
    <div
      className={clsx("flex items-center gap-1", sizeClasses[size], className)}
    >
      <span className="text-yellow-400">★</span>
      <span className="font-medium">{rating}</span>
      {showReviewCount && reviewCount && (
        <>
          <span className="text-primary/60">•</span>
          <span className="text-primary/80">{reviewCount} reviews</span>
        </>
      )}
    </div>
  )
}
