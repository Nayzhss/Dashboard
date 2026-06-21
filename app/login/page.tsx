"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { PasswordInput } from "@/app/components/PasswordInput"

const inputCls =
  "w-full px-3 py-2 bg-[#0f0f14] border border-white/5 rounded-lg text-sm text-white placeholder:text-[#3a3a50] focus:outline-none focus:border-violet-500/50"

export default function LoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    let email = identifier.trim()

    if (!email.includes("@")) {
      try {
        const res = await fetch("/api/auth/resolve-username", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: email }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError("Identifiants incorrects")
          setLoading(false)
          return
        }
        email = data.email
      } catch {
        setError("Identifiants incorrects")
        setLoading(false)
        return
      }
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError("Identifiants incorrects")
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
            type="text"
            required
            placeholder="Email ou nom d'utilisateur"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className={inputCls}
          />

          <PasswordInput
            value={password}
            onChange={setPassword}
            placeholder="Mot de passe"
            className={inputCls}
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
