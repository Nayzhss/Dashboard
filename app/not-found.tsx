import { Header } from "./components/Header"
import { Footer } from "./components/Footer"
import { BackgroundOrbs } from "./components/BackgroundOrbs"

export default function NotFound() {
  return (
    <main className="relative overflow-hidden min-h-screen bg-[var(--bg)] text-[var(--color-white)] flex flex-col">
      <BackgroundOrbs />

      <div className="relative z-10 flex flex-col flex-1">
        <Header />

        <div className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="animate-fade-up max-w-md text-center">
            <div className="text-5xl mb-4">📭</div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Page introuvable
            </h1>
            <p className="text-sm text-[var(--text-3)] mt-3">
              Ce lien ne mène nulle part, ou la page a été déplacée.
            </p>

            <a
              href="/"
              className="inline-flex items-center gap-2 mt-6 px-4 py-2.5 rounded-xl bg-[var(--accent-600)] hover:bg-[var(--accent-500)] text-sm font-medium text-[#fff] transition-colors"
            >
              Retour à l'accueil
            </a>
          </div>
        </div>

        <Footer />
      </div>
    </main>
  )
}
