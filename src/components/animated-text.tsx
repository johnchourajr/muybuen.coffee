"use client"
import clsx from "clsx"
import { motion } from "motion/react"
import Link from "next/link"
import { Headline } from "./headline"

// a component that splits each character into a span
export interface TextWrapProps {
  text: string
}

export const TextWrap: React.FC<TextWrapProps> = ({ text, ...extra }) => {
  const textArray = text.split("")
  const indexedCharacters = textArray.map((char, index) => {
    return { char, index }
  })

  // console.log(textArray);
  const firstPart = indexedCharacters.slice(0, 9)
  const secondPart = indexedCharacters.slice(9)

  const result = [firstPart, secondPart]

  const variants = {
    initial: {
      fontWeight: 750,
    },
    animate: {
      fontWeight: 50,
    },
  }

  const duration = 8

  // take duration and divide by textArray.length then multiply by index
  const delay = (index: number) => {
    const calc = duration / textArray.length
    const result = calc * index
    return result
  }

  return (
    <>
      {result.map((section, i) => {
        return (
          <span key={i}>
            {section.map(({ char, index }, idx) => {
              const d = delay(index)

              return (
                <motion.span
                  key={idx}
                  data-text-wrap-char={char}
                  variants={variants}
                  initial={"initial"}
                  animate={"animate"}
                  exit={"initial"}
                  transition={{
                    // delay: d,
                    duration: duration,
                    ease: "linear",
                    repeat: Infinity,
                    repeatType: "reverse", // Reverse the animation on each repeat
                  }}
                  {...extra}
                >
                  {char}
                </motion.span>
              )
            })}
            {"\r"}
          </span>
        )
      })}
    </>
  )
}

export interface AnimatedHeaderProps {}

export const AnimatedHeader: React.FC<AnimatedHeaderProps> = ({ ...extra }) => {
  return (
    <Link
      href={"/"}
      className={clsx(
        "w-full h-[30vw] md:h-[8vw] overflow-hidden relative inline-flex items-center justify-center",
      )}
      aria-label="Muy Buen Coffee Logo"
    >
      <Headline
        level={"5xl"}
        font="rulik"
        className={clsx(
          "absolute !text-[20vw] md:!text-[12vw] inline-block md:whitespace-nowrap text-center !leading-[.75] text-secondary",
        )}
      >
        <TextWrap text={"Muy Buen © Coffee"} />
      </Headline>
    </Link>
  )
}
