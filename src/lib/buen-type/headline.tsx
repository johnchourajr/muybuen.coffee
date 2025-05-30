import clsx from "clsx"

export const headlineTypeLevels = [
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
  "3xl",
  "4xl",
  "5xl",
]
export type Levels = (typeof headlineTypeLevels)[number]

export interface HeadlineProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  level: Levels
  font: "inter" | "rulik"
}

export const Headline: React.FC<HeadlineProps> = ({
  level,
  font,
  children,
  className,
  ...extra
}) => {
  const typeSize = () => {
    switch (level) {
      case "sm":
        return "text-buen-sm"
      case "md":
        return "text-buen-md"
      case "lg":
        return "text-buen-lg"
      case "xl":
        return "text-buen-xl"
      case "2xl":
        return "text-buen-2xl"
      case "3xl":
        return "text-buen-3xl"
      case "4xl":
        return "text-buen-4xl"
      case "5xl":
        return "text-buen-5xl"
      default:
        return "text-buen-md"
    }
  }

  const handleFont = () => {
    switch (font) {
      case "inter":
        return "font-inter"
      case "rulik":
        return "font-rulik tracking-[-0.02em]"
      default:
        return "font-inter"
    }
  }

  return (
    <p className={clsx(typeSize(), handleFont(), className)} {...extra}>
      {children}
    </p>
  )
}
