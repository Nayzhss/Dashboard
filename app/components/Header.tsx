"use client"

import { usePathname } from "next/navigation"
import { LogoutButton } from "./LogoutButton"

const NAV_LINKS = [
  { href: "/", label: "Boutiques" },
  { href: "/dashboard", label: "Dashboard" },
]

export function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0b0b10]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 shrink-0">
          <img
            src="/favicon.ico"
            alt=""
            className="w-6 h-6 rounded-md"
          />
          <span className="font-semibold text-sm text-white hidden sm:inline">
            OPENRF Community
          </span>
        </div>

        <nav className="header-nav flex items-center gap-1 overflow-x-auto">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href
            return (
              <a
                key={link.href}
                href={link.href}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  active
                    ? "bg-violet-500/10 text-violet-300"
                    : "text-[#8080a0] hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </a>
            )
          })}
        </nav>

        <div className="shrink-0">
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
