"use client"

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { AdminSidebar } from "@/components/layout/admin-sidebar"

export default function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const pathname = usePathname()

  // 🔒 Hide layout for login page
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">

        {/* SIDEBAR */}
        <aside className="hidden lg:flex lg:flex-col border-r border-gray-200 bg-white">
          <div className="flex-1 overflow-y-auto">
            <AdminSidebar />
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div className="flex min-h-screen flex-col">

          {/* CONTENT AREA */}
          <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1400px]">
              {children}
            </div>
          </main>

        </div>
      </div>
    </div>
  )
}