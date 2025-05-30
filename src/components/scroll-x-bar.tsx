"use client"
import { motion, useScroll, useTransform } from "motion/react"

export interface ScrollXBarProps {
  forwardRef: any
}

export const ScrollXBar: React.FC<ScrollXBarProps> = ({ forwardRef }) => {
  const { scrollXProgress } = useScroll({ container: forwardRef || undefined })

  const left = useTransform(
    scrollXProgress,
    [0, 1],
    ["calc(0% - 0px)", "calc(100% - 2rem)"],
  )

  return (
    <div className="grid-container">
      <div className="col-span-full flex items-center justify-center">
        <div className="relative w-24 h-2 glass-card glass-card--gray bg-ground flex items-center rounded-full">
          <motion.div
            className="absolute h-full w-[2rem] rounded-full glass-card glass-card--gray"
            style={{ left }}
          />
        </div>
      </div>
    </div>
  )
}
