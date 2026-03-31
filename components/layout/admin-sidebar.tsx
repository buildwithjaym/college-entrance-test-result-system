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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navSections = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Result Operations",
    items: [
      { label: "Applicants", href: "/admin/applicants", icon: Users },
      {
        label: "Test Schedules",
        href: "/admin/test-schedules",
        icon: CalendarDays,
      },
      { label: "Results", href: "/admin/results", icon: FileCheck2 },
      {
        label: "Publish Results",
        href: "/admin/publish-results",
        icon: ClipboardList,
      },
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

  const handleLogout = () => {
    router.push("/admin/login")
  }

  return (
    <aside className="flex h-screen flex-col border-r border-primary/10 bg-white/95 backdrop-blur-xl">
      <div className="border-b border-primary/10 px-5 py-5">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-primary/10">
            <Image
              src="/logo.jpg"
              alt="Basilan State College logo"
              width={48}
              height={48}
              className="h-12 w-12 object-contain"
              priority
            />
          </div>

          <div className="min-w-0">
            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
              Basilan State College
            </p>
            <h1 className="truncate text-base font-bold leading-tight text-foreground">
              Result Access
            </h1>
            <p className="truncate text-xs text-muted-foreground">
              Admin Portal
            </p>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <nav className="space-y-7">
          {navSections.map((section) => (
            <div key={section.title}>
              <p className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {section.title}
              </p>

              <div className="space-y-1.5">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "text-foreground hover:bg-primary/5 hover:text-primary"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isActive
                            ? "text-primary-foreground"
                            : "text-muted-foreground group-hover:text-primary"
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="border-t border-primary/10 p-4">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start rounded-2xl text-muted-foreground hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  )
}