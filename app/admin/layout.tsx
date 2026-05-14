"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import type { ReactNode } from "react"

import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { createClient } from "@/lib/supabase/client"

export default function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function checkAdminAccess() {
      if (pathname === "/admin/login") {
        setChecking(false)
        return
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace("/")
        return
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle()

      if (error || !profile || profile.role !== "admin") {
        await supabase.auth.signOut()
        router.replace("/")
        return
      }

      setChecking(false)
    }

    checkAdminAccess()
  }, [pathname, router, supabase])

  if (checking && pathname !== "/admin/login") {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-gray-50 px-4">
        <div className="rounded-3xl border border-red-100 bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-bold text-red-700">
            Checking admin access...
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Please wait while we verify your account.
          </p>
        </div>
      </main>
    )
  }

  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  return (
    <div className="min-h-dvh bg-gray-50">
      <AdminSidebar />

      <main className="min-h-dvh px-4 pb-6 pt-20 transition-all duration-300 sm:px-6 md:ml-[280px] md:pt-6 lg:px-8">
        <div className="mx-auto w-full max-w-[1500px]">{children}</div>
      </main>
    </div>
  )
}