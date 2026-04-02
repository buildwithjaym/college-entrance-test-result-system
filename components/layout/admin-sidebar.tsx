"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  CalendarDays,
  ClipboardList,
  FileBarChart2,
  FileCheck2,
  LayoutDashboard,
  LogOut,
  School,
  Users,
  Menu,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const navSections = [
  {
    title: "Main",
    items: [{ label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Operations",
    items: [
      { label: "Applicants", href: "/admin/applicants", icon: Users },
      { label: "Schedules", href: "/admin/test-schedules", icon: CalendarDays },
      { label: "Results", href: "/admin/results", icon: FileCheck2 },
      { label: "Publish", href: "/admin/publish-results", icon: ClipboardList },
    ],
  },
  {
    title: "Records",
    items: [
      { label: "Reports", href: "/admin/reports", icon: FileBarChart2 },
      { label: "School Years", href: "/admin/school-years", icon: School },
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
      {/* MOBILE MENU BUTTON */}
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-white p-2 shadow-md md:hidden"
      >
        <Menu className="h-5 w-5 text-red-600" />
      </button>

      {/* BACKDROP */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-64 flex-col bg-white transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white ring-1 ring-gray-200">
              <Image
                src="/logo.jpg"
                alt="Logo"
                width={36}
                height={36}
                className="object-contain"
                priority
              />
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-400">
                BASC
              </p>
              <p className="text-sm font-semibold text-gray-900">
                Admin Panel
              </p>
            </div>
          </Link>

          <button className="md:hidden" onClick={() => setOpen(false)}>
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* NAVIGATION */}
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <nav className="space-y-6">
            {navSections.map((section) => (
              <div key={section.title}>
                <p className="mb-2 px-2 text-[10px] uppercase tracking-wider text-gray-400">
                  {section.title}
                </p>

                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                          isActive
                            ? "bg-red-600 text-white shadow-sm"
                            : "text-gray-600 hover:bg-red-50 hover:text-red-600"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4",
                            isActive
                              ? "text-white"
                              : "text-gray-400 group-hover:text-red-600"
                          )}
                        />

                        {item.label}

                        {isActive && (
                          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* FOOTER */}
        <div className="border-t px-4 py-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}