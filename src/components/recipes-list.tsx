"use client"
import recipesData from "@/data/recipes/recipes"
import clsx from "clsx"
import { motion } from "motion/react"
import Image from "next/image"
import Link from "next/link"
import { ScrollXWrapper } from "./scroll-x-wrapper"

export const RecipesList = () => {
  const MotionLink = motion(Link)
  return (
    <>
      <ScrollXWrapper>
        {recipesData.map((recipe) => {
          return (
            <MotionLink
              key={recipe.slug}
              href={`/recipes/${recipe.slug}`}
              className={clsx(
                "glass-card glass-card--light-blue",
                "min-h-[13rem] md:min-h-[18rem] w-[13rem] md:w-[18rem]",
                "relative flex h-full  bg-primaryLight md:py-7 py-5 md:px-9 px-6 rounded-3xl",
              )}
              style={{
                willChange: "transform",
              }}
              whileHover={{
                scale: 1.01,
              }}
              whileTap={{
                scale: 0.98,
              }}
              transition={{
                duration: 0.5,
                ease: "circOut",
              }}
            >
              <h3 className="text-buen-lg">{recipe.title}</h3>
              <Image
                src={recipe.background}
                alt={recipe.title}
                className="absolute object-contain w-full h-full"
                fill={true}
                sizes="18rem"
              />
            </MotionLink>
          )
        })}
      </ScrollXWrapper>
    </>
  )
}
