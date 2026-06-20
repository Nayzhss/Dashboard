"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError("Email ou mot de passe incorrect")
      setLoading(false)
      return
    }

    router.replace("/")
    router.refresh()
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0b0b10] text-white px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-[#16161f] border border-white/5 rounded-2xl p-6"
      >
        <h1 className="text-lg font-semibold mb-6">Connexion</h1>

        <div className="flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-[#0f0f14] border border-white/5 rounded-lg text-sm text-white placeholder:text-[#3a3a50] focus:outline-none focus:border-violet-500/50"
          />

          <input
            type="password"
            required
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-[#0f0f14] border border-white/5 rounded-lg text-sm text-white placeholder:text-[#3a3a50] focus:outline-none focus:border-violet-500/50"
          />

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 rounded-xl py-2.5 text-sm font-medium transition-colors"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </div>

        <p className="text-xs text-[#6b6b80] mt-4 text-center">
          Pas de compte ?{" "}
          <a href="/signup" className="text-violet-300 hover:underline">
            Créer un compte
          </a>
        </p>
      </form>
    </main>
  )
}
