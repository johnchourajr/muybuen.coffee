"use client"

import clsx from "clsx"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { NavLink } from "../nav-link"
import LogoIcon from "../svg/icon"

export interface NavProps {}

export const Nav: React.FC<NavProps> = ({ ...extra }) => {
  const router = usePathname()

  const links = [
    {
      href: "/",
      label: "Find",
    },
    {
      href: "/recipes",
      label: "Brew",
    },
  ]

  return (
    <>
      <nav className="grid-container w-[calc(100%-1rem)] glass-card glass-card--gray py-5 items-center fixed md:sticky top-[unset] z-50 md:top-12 bottom-3 md:translate-y-[-50%] mx-2 md:mx-auto ">
        <Link href="/" aria-label="Logo">
          <LogoIcon className="col-span-1" />
        </Link>

        <div
          className={clsx(
            "auto-cols-auto col-end-[end] text-end inline-flex gap-2 uppercase font-futura text-xs tracking-widest font-bold w-full justify-end",
          )}
        >
          {links.map(({ href, label }) => {
            const isActive = router === href

            return (
              <NavLink
                key={href}
                href={href}
                className={clsx(isActive && "underline")}
              >
                {label}
              </NavLink>
            )
          })}
        </div>
      </nav>
    </>
  )
}
