"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  CalendarDays,
  FileBarChart2,
  FileCheck2,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  QrCode,
  UploadCloud,
  Users,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const navSections = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Management",
    items: [
      { label: "Applicants", href: "/admin/applicants", icon: Users },
      { label: "Release Results", href: "/admin/publish-results", icon: UploadCloud },
      { label: "Result Records", href: "/admin/results", icon: FileCheck2 },
    ],
  },
  {
    title: "Monitoring",
    items: [
      { label: "Reports & Analytics", href: "/admin/reports", icon: FileBarChart2 },
      { label: "QR Scanner", href: "/admin/qr-scanner", icon: QrCode },
    ],
  },
  {
    title: "System Setup",
    items: [
      { label: "Test Schedules", href: "/admin/test-schedules", icon: CalendarDays },
      { label: "Academic Years", href: "/admin/school-years", icon: GraduationCap },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    router.push("/admin/login")
  }

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-lg ring-1 ring-gray-200 md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5 text-red-700" />
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-dvh w-[280px] flex-col border-r border-gray-200 bg-white shadow-sm transition-transform duration-300 md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex h-[82px] items-center justify-between border-b border-gray-100 px-5">
          <Link
            href="/admin/dashboard"
            onClick={() => setOpen(false)}
            className="flex min-w-0 items-center gap-3"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 ring-1 ring-red-100">
              <Image
                src="/new.png"
                alt="CET Logo"
                width={36}
                height={36}
                className="object-contain"
                priority
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                Testing & Evaluation
              </p>
              <p className="truncate text-base font-bold text-gray-950">
                Admin Panel
              </p>
            </div>
          </Link>

          <button
            onClick={() => setOpen(false)}
            className="rounded-xl p-2 hover:bg-gray-100 md:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation - compact, no scrolling needed */}
        <div className="flex flex-1 flex-col justify-between px-4 py-4">
          <nav className="space-y-4">
            {navSections.map((section) => (
              <div key={section.title}>
                <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                  {section.title}
                </p>

                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    const isActive =
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`)

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
                          isActive
                            ? "bg-gradient-to-r from-red-700 to-red-600 text-white shadow-md shadow-red-900/15"
                            : "text-gray-600 hover:bg-gray-50 hover:text-red-700"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-xl transition",
                            isActive
                              ? "bg-white/15"
                              : "bg-gray-50 text-gray-400 group-hover:bg-red-50 group-hover:text-red-700"
                          )}
                        >
                          <Icon className="h-4.5 w-4.5" />
                        </span>

                        <span className="truncate">{item.label}</span>

                        {isActive && (
                          <span className="ml-auto h-2 w-2 rounded-full bg-white/90" />
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Bottom area */}
          <div className="space-y-3 border-t border-gray-100 pt-4">
            <div className="rounded-2xl bg-gray-50 px-4 py-3 ring-1 ring-gray-100">
              <p className="text-sm font-bold text-gray-900">TEC Admin</p>
              <p className="text-xs text-gray-500">Authorized Staff</p>
            </div>

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-700"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-50">
                <LogOut className="h-4.5 w-4.5" />
              </span>
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}