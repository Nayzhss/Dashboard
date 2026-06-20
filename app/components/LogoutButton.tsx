"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace("/login")
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-[#6b6b80] hover:text-white transition-colors"
    >
      Déconnexion
    </button>
  )
}
