"use client"

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { AdminHeader } from "@/components/layout/admin-header"
import { AdminSidebar } from "@/components/layout/admin-sidebar"

export default function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const pathname = usePathname()

  
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-[290px_1fr]">
        <div className="hidden border-r border-primary/10 bg-white/95 backdrop-blur-xl lg:block">
          <AdminSidebar />
        </div>

        <div className="flex min-h-screen flex-col">
          <AdminHeader />

          <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6">
            <div className="mx-auto w-full max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}