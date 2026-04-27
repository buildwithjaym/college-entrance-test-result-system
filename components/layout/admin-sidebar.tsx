"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileBarChart2,
  FileCheck2,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
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
      {
        label: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        label: "Applicants",
        href: "/admin/applicants",
        icon: Users,
      },
      {
        label: "Release Results",
        href: "/admin/publish-results",
        icon: UploadCloud,
        badge: "1",
      },
      {
        label: "Result Records",
        href: "/admin/results",
        icon: FileCheck2,
      },
    ],
  },
  {
    title: "Monitoring",
    items: [
      {
        label: "Reports & Analytics",
        href: "/admin/reports",
        icon: FileBarChart2,
      },
    ],
  },
  {
    title: "System Setup",
    items: [
      {
        label: "Test Schedules",
        href: "/admin/test-schedules",
        icon: CalendarDays,
      },
      {
        label: "Academic Years",
        href: "/admin/school-years",
        icon: GraduationCap,
      },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    router.push("/admin/login")
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-xl bg-white p-2 shadow-md ring-1 ring-gray-200 md:hidden"
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5 text-red-600" />
      </button>

      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300",
          collapsed ? "md:w-20" : "w-72",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
          <Link
            href="/admin/dashboard"
            className="flex min-w-0 items-center gap-3"
            onClick={() => setOpen(false)}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 ring-1 ring-red-100">
              <Image
                src="/new.png"
                alt="CET Logo"
                width={34}
                height={34}
                className="object-contain"
                priority
              />
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-[10px] font-medium uppercase tracking-widest text-gray-400">
                  Testing & Evaluation Center
                </p>
                <p className="truncate text-sm font-bold text-gray-900">
                  Admin Panel
                </p>
              </div>
            )}
          </Link>

          <button
            className="rounded-lg p-1.5 hover:bg-gray-100 md:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Collapse button desktop */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 hidden h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm hover:bg-red-50 md:flex"
          aria-label="Collapse sidebar"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-500" />
          )}
        </button>

        {/* Quick action */}
        {!collapsed && (
          <div className="px-4 pt-5">
            <Link
              href="/admin/publish-results"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
            >
              <ClipboardCheck className="h-4 w-4" />
              Release CET Results
            </Link>
          </div>
        )}

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <nav className="space-y-6">
            {navSections.map((section) => (
              <div key={section.title}>
                {!collapsed && (
                  <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                    {section.title}
                  </p>
                )}

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
                        title={collapsed ? item.label : undefined}
                        className={cn(
                          "group relative flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                          collapsed ? "justify-center" : "gap-3",
                          isActive
                            ? "bg-red-50 text-red-700"
                            : "text-gray-600 hover:bg-gray-50 hover:text-red-600"
                        )}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-red-600" />
                        )}

                        <Icon
                          className={cn(
                            "h-5 w-5 shrink-0 transition",
                            isActive
                              ? "text-red-600"
                              : "text-gray-400 group-hover:text-red-600"
                          )}
                        />

                        {!collapsed && (
                          <>
                            <span className="flex-1 truncate">
                              {item.label}
                            </span>

                            {item.badge && (
                              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Admin identity */}
        {!collapsed && (
          <div className="mx-4 mb-3 rounded-2xl bg-gray-50 p-3 ring-1 ring-gray-100">
            <p className="text-sm font-semibold text-gray-900">TEC Admin</p>
            <p className="text-xs text-gray-500">Authorized Staff</p>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-100 px-3 py-4">
          <button
            onClick={handleLogout}
            className={cn(
              "flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-600",
              collapsed ? "justify-center" : "gap-3"
            )}
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && "Logout"}
          </button>
        </div>
      </aside>
    </>
  )
}