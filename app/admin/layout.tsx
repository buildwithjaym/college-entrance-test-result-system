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

  // Hide admin shell on login page
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  return (
    <div className="min-h-dvh bg-gray-50">
      {/* Sidebar handles desktop + mobile hamburger internally */}
      <AdminSidebar />

      {/* Main content */}
      <main className="min-h-dvh px-4 pb-6 pt-20 transition-all duration-300 md:ml-[280px] md:pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-[1500px]">
          {children}
        </div>
      </main>
    </div>
  )
}