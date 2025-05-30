"use client"
import clsx from "clsx"
import { motion, useWillChange } from "motion/react"
import Link from "next/link"

export type ResultTileProps = {
  children?: React.ReactNode
  className?: string
  href?: string
  uid?: string
}

/**
 * ResultTile - A reusable tile component that can contain any content
 *
 * Example usage with new smaller components:
 *
 * <ResultTile href="/shop/example">
 *   <BusinessCardContent
 *     name="Coffee Shop"
 *     rating={4.5}
 *     reviewCount={123}
 *     address={["123 Main St", "New York, NY"]}
 *     distance="0.5 miles"
 *     imageUrl="/image.jpg"
 *     buentag="Special Tag"
 *   />
 * </ResultTile>
 *
 * Or build custom content using smaller components:
 * <ResultTile>
 *   <div className="p-6">
 *     <h3>Custom Title</h3>
 *     <RatingDisplay rating={4.5} reviewCount={100} />
 *     <StatusBadge variant="verified" label="Verified" />
 *     <BusinessInfo items={[{label: "Distance", value: "1 mile"}]} />
 *   </div>
 * </ResultTile>
 */
export const ResultTile = ({
  children,
  className,
  href,
  uid,
  ...extra
}: ResultTileProps) => {
  const willChange = useWillChange()

  const animatedProps = children && {
    whileHover: {
      scale: 1.01,
    },
    whileTap: {
      scale: 0.98,
    },
    transition: {
      duration: 0.5,
      ease: "circOut",
    },
    style: { willChange } as any,
  }

  const commonClassName = clsx(
    "glass-card glass-card--light-blue overflow-hidden",
    "min-h-[13rem] md:min-h-[18rem] w-[13rem] md:w-[18rem]",
    "relative flex flex-col h-full md:py-7 py-5 md:px-9 px-6 rounded-3xl",
    children && "bg-primaryLight",
    !children && "bg-white bg-opacity-10",
    className,
  )

  if (href) {
    const MotionLink = motion(Link)
    const isExternal = href.startsWith("http")

    return (
      <MotionLink
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className={commonClassName}
        {...animatedProps}
        {...extra}
      >
        {children}
      </MotionLink>
    )
  }

  return (
    <motion.div className={commonClassName} {...animatedProps} {...extra}>
      {children}
    </motion.div>
  )
}
