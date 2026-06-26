"use client"

import { Header } from "./components/Header"
import { Footer } from "./components/Footer"
import { BackgroundOrbs } from "./components/BackgroundOrbs"
import { ShopLogoMarquee } from "./components/ShopLogoMarquee"

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

const FEATURES = [
  { emoji: "🔄", label: "Suivi auto des livraisons" },
  { emoji: "⏱", label: "Délais calculés tout seuls" },
  { emoji: "🔐", label: "Chacun ses commandes" },
]

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-[var(--bg)] text-[var(--color-white)] flex flex-col overflow-hidden">
      <BackgroundOrbs />

      <Header />

      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-3xl w-full text-center">
          <span
            className="animate-fade-up inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-[var(--surface)] text-xs text-[var(--text-3)] mb-5"
            style={{ animationDelay: "0ms" }}
          >
            <span className="relative flex w-1.5 h-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--accent-400)] opacity-60 animate-ping" />
              <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-[var(--accent-400)]" />
            </span>
            Espace privé · les frérots
          </span>

          <h1
            className="animate-fade-up text-3xl sm:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-[var(--color-white)] via-[var(--color-white)] to-[var(--accent-300)]"
            style={{ animationDelay: "80ms" }}
          >
            OPENRF Community
          </h1>

          <p
            className="animate-fade-up text-[var(--text-3)] mt-4 text-sm sm:text-base max-w-xl mx-auto"
            style={{ animationDelay: "160ms" }}
          >
            Le dashboard pour suivre tes commandes, tes remboursements, et savoir
            quelles boutiques valent vraiment le coup — sans tableau qui traîne,
            sans relancer le suivi à la main.
          </p>

          <div
            className="animate-fade-up mt-6 flex flex-wrap items-center justify-center gap-2"
            style={{ animationDelay: "220ms" }}
          >
            {FEATURES.map((f) => (
              <span
                key={f.label}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--surface)] border border-white/5 text-xs text-[var(--text-2)]"
              >
                <span>{f.emoji}</span>
                {f.label}
              </span>
            ))}
          </div>

          <div className="mt-10 grid sm:grid-cols-3 gap-4 text-left">
            {LINKS.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                className="animate-fade-up group relative bg-[var(--surface)] border border-white/5 rounded-2xl p-5 hover:border-[var(--accent-400)]/50 hover:-translate-y-1 transition-all duration-300"
                style={{ animationDelay: `${280 + i * 90}ms` }}
              >
                <div className="text-2xl mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                  {link.emoji}
                </div>
                <h2 className="font-semibold flex items-center gap-1.5">
                  {link.title}
                  <span className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-[var(--accent-300)]">
                    →
                  </span>
                </h2>
                <p className="text-xs text-[var(--text-4)] mt-1.5">
                  {link.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 pb-12">
        <ShopLogoMarquee />
      </div>

      <Footer />
    </main>
  )
}
