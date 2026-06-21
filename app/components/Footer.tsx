export function Footer() {
  return (
    <footer className="border-t border-white/5 py-6 text-center">
      <p className="text-sm text-[var(--text-3)]">
        Fait par{" "}
        <span className="text-[var(--accent-300)] font-medium">Brrrr</span> ·{" "}
        {new Date().getFullYear()}
      </p>
      <p className="text-xs text-[var(--text-5)] mt-1">
        Dashboard pour les frérots, régalez-vous.
      </p>
    </footer>
  )
}
