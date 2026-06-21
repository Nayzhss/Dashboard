export function Footer() {
  return (
    <footer className="border-t border-white/5 py-6 text-center">
      <p className="text-sm text-[#8080a0]">
        Fait par{" "}
        <span className="text-violet-300 font-medium">Brrrr</span> ·{" "}
        {new Date().getFullYear()}
      </p>
      <p className="text-xs text-[#4a4a60] mt-1">
        Dashboard pour les frérots, régalez-vous.
      </p>
    </footer>
  )
}
