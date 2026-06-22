/**
 * À placer en premier enfant d'un <main className="relative overflow-hidden">
 * — le contenu suivant doit avoir className="relative z-10" pour passer au-dessus.
 */
export function BackgroundOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-32 -left-24 w-80 h-80 rounded-full bg-[var(--accent-500)]/20 blur-3xl animate-float-slow" />
      <div className="absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-[var(--accent-400)]/15 blur-3xl animate-float-slower" />
      <div className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full bg-[var(--accent-600)]/15 blur-3xl animate-float-mid" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-[var(--accent-300)]/10 blur-3xl animate-float-slower" />
    </div>
  )
}
