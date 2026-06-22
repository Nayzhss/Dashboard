"use client"

import { Header } from "./components/Header"
import { Footer } from "./components/Footer"

const LINKS = [
  {
    href: "/boutiques",
    title: "Boutiques",
    description: "Catalogue des boutiques, méthodes, taux de réussite et rentabilité.",
    emoji: "🏬",
  },
  {
    href: "/dashboard",
    title: "Dashboard",
    description: "Tes commandes, leurs statuts, délais et suivis de livraison.",
    emoji: "📦",
  },
  {
    href: "/aide",
    title: "Aide",
    description: "Comment fonctionne le suivi automatique, les délais, et le reste.",
    emoji: "❓",
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--color-white)] flex flex-col">
      <Header />

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-3xl w-full text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            OPENRF Community
          </h1>
          <p className="text-[var(--text-3)] mt-3 text-sm sm:text-base">
            Le dashboard pour suivre tes commandes, tes remboursements, et savoir
            quelles boutiques valent vraiment le coup.
          </p>

          <div className="mt-10 grid sm:grid-cols-3 gap-4 text-left">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="bg-[var(--surface)] border border-white/5 rounded-2xl p-5 hover:border-[var(--accent-400)]/50 transition-colors"
              >
                <div className="text-2xl mb-3">{link.emoji}</div>
                <h2 className="font-semibold">{link.title}</h2>
                <p className="text-xs text-[var(--text-4)] mt-1.5">
                  {link.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
