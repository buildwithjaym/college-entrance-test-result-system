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
import { useState } from "react"

import { cn } from "@/lib/utils"

const navSections = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard }],
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

  function handleLogout() {
    router.push("/admin/login")
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-lg ring-1 ring-gray-200 md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5 text-red-700" />
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-dvh w-[280px] flex-col border-r border-gray-200 bg-white shadow-sm transition-transform duration-300 md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-[64px] shrink-0 items-center justify-between border-b border-gray-100 px-4">
          <Link
            href="/admin/dashboard"
            onClick={() => setOpen(false)}
            className="flex min-w-0 items-center gap-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-50 ring-1 ring-red-100">
              <Image
                src="/new.png"
                alt="CET Logo"
                width={30}
                height={30}
                className="object-contain"
                priority
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-[9px] font-bold uppercase tracking-[0.16em] text-gray-400">
                Testing & Evaluation
              </p>
              <p className="truncate text-sm font-black text-gray-950">
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

        <div className="flex min-h-0 flex-1 flex-col px-3 py-3">
          <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            {navSections.map((section) => (
              <div key={section.title}>
                <p className="mb-1 px-2.5 text-[9px] font-black uppercase tracking-[0.15em] text-gray-400">
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
                          "group relative flex items-center gap-2.5 rounded-2xl px-3 py-2 text-sm font-semibold transition-all",
                          isActive
                            ? "bg-gradient-to-r from-red-700 to-red-600 text-white shadow-md shadow-red-900/15"
                            : "text-gray-600 hover:bg-gray-50 hover:text-red-700"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-xl transition",
                            isActive
                              ? "bg-white/15"
                              : "bg-gray-50 text-gray-400 group-hover:bg-red-50 group-hover:text-red-700"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>

                        <span className="truncate">{item.label}</span>

                        {isActive ? (
                          <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-white/90" />
                        ) : null}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="shrink-0 space-y-2 border-t border-gray-100 pt-3">
            <div className="rounded-2xl bg-gray-50 px-3 py-2 ring-1 ring-gray-100">
              <p className="text-sm font-black text-gray-900">TEC Admin</p>
              <p className="text-xs text-gray-500">Authorized Staff</p>
            </div>

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-2xl px-3 py-2 text-sm font-semibold text-gray-500 transition hover:bg-red-50 hover:text-red-700"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-gray-50">
                <LogOut className="h-4 w-4" />
              </span>
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}