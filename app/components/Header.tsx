"use client"

import { usePathname } from "next/navigation"
import { LogoutButton } from "./LogoutButton"
import { ThemeToggle } from "./ThemeToggle"

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/boutiques", label: "Boutiques" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/aide", label: "Aide" },
]

export function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[var(--bg)]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
        <a href="/" className="flex items-center gap-2.5 shrink-0">
          <img
            src="/favicon.ico"
            alt=""
            className="w-6 h-6 rounded-md"
          />
          <span className="font-semibold text-sm text-[var(--color-white)] hidden sm:inline">
            OPENRF Community
          </span>
        </a>

        <nav className="header-nav flex items-center gap-1 overflow-x-auto">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href
            return (
              <a
                key={link.href}
                href={link.href}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  active
                    ? "bg-[var(--accent-500)]/10 text-[var(--accent-300)]"
                    : "text-[var(--text-3)] hover:text-[var(--color-white)] hover:bg-white/5"
                }`}
              >
                {link.label}
              </a>
            )
          })}
        </nav>

        <div className="shrink-0 flex items-center gap-2">
          <ThemeToggle />
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
