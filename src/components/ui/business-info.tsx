"use client"
import clsx from "clsx"
import React from "react"

export interface BusinessInfoProps {
  items: Array<{
    label: string
    value: string | number | React.ReactNode
    icon?: string
  }>
  orientation?: "horizontal" | "vertical"
  separator?: string
  className?: string
  itemClassName?: string
}

export const BusinessInfo = ({
  items,
  orientation = "horizontal",
  separator = "•",
  className,
  itemClassName,
}: BusinessInfoProps) => {
  const containerClasses = {
    horizontal: "flex items-center space-x-2 flex-wrap",
    vertical: "flex flex-col space-y-1",
  }

  return (
    <div className={clsx(containerClasses[orientation], className)}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && orientation === "horizontal" && (
            <span className="text-primary/60 mx-2">{separator}</span>
          )}
          <span className={clsx("text-nowrap", itemClassName)}>
            {item.icon && <span className="mr-1">{item.icon}</span>}
            {item.label && <span className="mr-1">{item.label}:</span>}
            {item.value}
          </span>
        </div>
      ))}
    </div>
  )
}
