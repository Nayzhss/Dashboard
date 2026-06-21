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
          <div className="w-6 h-6 rounded-md bg-violet-500 flex items-center justify-center">
            <svg
              className="w-3.5 h-3.5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0H4"
              />
            </svg>
          </div>
          <span className="font-semibold text-sm text-white hidden sm:inline">
            Remboursements
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
