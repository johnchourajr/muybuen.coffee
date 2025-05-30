"use client"
import { motion } from "motion/react"

interface ShopActionsProps {
  yelpUrl: string
  displayAddress: string[]
}

export const ShopActions = ({ yelpUrl, displayAddress }: ShopActionsProps) => {
  return (
    <div className="flex flex-col space-y-3">
      <motion.a
        href={yelpUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors text-center"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        View on Yelp ↗
      </motion.a>

      <motion.a
        href={`https://maps.google.com/?q=${encodeURIComponent(
          displayAddress.join(", "),
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="border-2 border-primary text-primary px-6 py-3 rounded-full font-semibold hover:bg-primary/5 transition-colors text-center"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Get Directions ↗
      </motion.a>
    </div>
  )
}
