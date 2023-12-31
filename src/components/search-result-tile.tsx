"use client"
import { motion, useWillChange } from "framer-motion"
import clsx from "clsx"
import Link from "next/link"

export type ResultTileProps = {
  children?: React.ReactNode
  className?: string
  href: string
  uid?: string
}

export const ResultTile = ({
  children,
  className,
  href = "",
  uid,
  ...extra
}: ResultTileProps) => {
  const willChange = useWillChange()
  const MotionLink = href ? motion(Link) : motion.div

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

  return (
    <MotionLink
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx(
        "glass-card glass-card--light-blue overflow-hidden",
        "min-h-[13rem] md:min-h-[18rem] w-[13rem] md:w-[18rem]",
        "relative flex flex-col h-full md:py-7 py-5 md:px-9 px-6 rounded-3xl",
        children && "bg-primaryLight",
        !children && "bg-white bg-opacity-10",
        className,
      )}
      {...animatedProps}
      {...extra}
    >
      {children}
    </MotionLink>
  )
}
