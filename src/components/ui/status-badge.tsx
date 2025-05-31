"use client";
import clsx from "clsx";

export interface StatusBadgeProps {
  variant: "verified" | "open" | "closed" | "custom" | "buen" | "shit";
  label: string;
  className?: string;
  icon?: string;
  layoutId?: string;
}

// Test variable to check if intellisense works
const testClasses = clsx("bg-red-500 text-white p-4");

export const StatusBadge = ({
  variant,
  label,
  className,
  icon,
  layoutId,
}: StatusBadgeProps) => {
  const baseClasses = clsx(
    "px-2 py-[2px] flex justify-center items-center rounded-full text-sm font-medium",
  );

  const variantClasses = {
    verified: clsx("bg-secondary text-primary"),
    open: clsx("bg-secondary/20 text-primary"),
    closed: clsx("bg-[#ff0000] text-white"),
    custom: clsx("bg-gray-100 text-gray-800"),
    buen: clsx("bg-primary text-white"),
    shit: clsx("bg-[#ff0000] text-white"),
  };

  return (
    <span className={clsx(baseClasses, variantClasses[variant], className)}>
      {icon && <span className="mr-1">{icon}</span>}
      {variant === "open" && (
        <figure className="w-2 h-2 mr-1 bg-secondary rounded-full" />
      )}
      {label}
    </span>
  );
};
