"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { PasswordInput } from "@/app/components/PasswordInput"
import { BackgroundOrbs } from "@/app/components/BackgroundOrbs"

const inputCls =
  "w-full px-3 py-2 bg-[var(--input-bg)] border border-white/5 rounded-lg text-sm text-[var(--color-white)] placeholder:text-[var(--text-6)] focus:outline-none focus:border-[var(--accent-500)]/50"

const USERNAME_RE = /^[a-z0-9_-]{3,20}$/

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  async function checkUsername() {
    const value = username.trim().toLowerCase()
    if (!value) return

    if (!USERNAME_RE.test(value)) {
      setUsernameError("3-20 caractères : lettres, chiffres, - ou _")
      return
    }

    const res = await fetch("/api/auth/check-username", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: value }),
    })
    const data = await res.json()
    setUsernameError(data.available ? null : "Ce nom d'utilisateur est déjà pris")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const value = username.trim().toLowerCase()
    if (!USERNAME_RE.test(value)) {
      setUsernameError("3-20 caractères : lettres, chiffres, - ou _")
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: value } },
    })

    if (error) {
      setError(
        error.message.toLowerCase().includes("duplicate") ||
          error.message.toLowerCase().includes("unique")
          ? "Ce nom d'utilisateur est déjà pris"
          : error.message
      )
      setLoading(false)
      return
    }

    setDone(true)
    setLoading(false)
  }

  if (done) {
    return (
      <main className="relative overflow-hidden min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--color-white)] px-4">
        <BackgroundOrbs />
        <div className="animate-fade-up relative z-10 w-full max-w-sm bg-[var(--surface)] border border-white/5 rounded-2xl p-6 text-center">
          <p className="text-sm text-[var(--text-1)]">
            Compte créé. Vérifie ta boîte mail pour confirmer ton adresse, puis{" "}
            <a href="/login" className="text-[var(--accent-300)] hover:underline">
              connecte-toi
            </a>
            .
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="relative overflow-hidden min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--color-white)] px-4">
      <BackgroundOrbs />

      <form
        onSubmit={handleSubmit}
        className="animate-fade-up relative z-10 w-full max-w-sm bg-[var(--surface)] border border-white/5 rounded-2xl p-6"
      >
        <h1 className="text-lg font-semibold mb-6">Créer un compte</h1>

        <div className="flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
          />

          <div>
            <input
              type="text"
              required
              placeholder="Nom d'utilisateur"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setUsernameError(null)
              }}
              onBlur={checkUsername}
              className={inputCls}
            />
            {usernameError && (
              <p className="text-xs text-red-400 mt-1">{usernameError}</p>
            )}
          </div>

          <PasswordInput
            value={password}
            onChange={setPassword}
            minLength={6}
            placeholder="Mot de passe (6 caractères min.)"
            className={inputCls}
          />

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading || !!usernameError}
            className="mt-2 w-full bg-[var(--accent-600)] hover:bg-[var(--accent-500)] disabled:opacity-40 rounded-xl py-2.5 text-sm font-medium text-[#fff] transition-colors"
          >
            {loading ? "Création…" : "Créer mon compte"}
          </button>
        </div>

        <p className="text-xs text-[var(--text-4)] mt-4 text-center">
          Déjà un compte ?{" "}
          <a href="/login" className="text-[var(--accent-300)] hover:underline">
            Se connecter
          </a>
        </p>
      </form>
    </main>
  )
}
