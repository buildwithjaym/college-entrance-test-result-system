import { Bell, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-primary/10 bg-background/90 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            Basilan State College
          </p>
          <h2 className="truncate text-lg font-bold text-foreground sm:text-xl">
            Online Result Access System
          </h2>
          <p className="hidden text-sm text-muted-foreground sm:block">
            Manage applicants, upload results, publish records, and support student downloads
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search applicants or results..."
              className="h-10 w-72 rounded-full border-primary/10 bg-white pl-9 shadow-sm focus-visible:ring-primary"
            />
          </div>

          <Button
            variant="outline"
            size="icon"
            className="rounded-full border-primary/15 bg-white shadow-sm hover:bg-primary/5"
          >
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}