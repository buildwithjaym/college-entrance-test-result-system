import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Home",
  description:
    "Access official CET results, check program recommendations, and view school-year-based exam result information for Basilan State College.",
}

export default function HomePage() {
  return (
    <main className="flex min-h-screen bg-background items-center justify-center overflow-hidden">
      <section className="mx-auto max-w-6xl px-6 py-12 md:py-16 text-center flex flex-col items-center justify-center">
        <div className="mb-6 inline-flex items-center rounded-full border border-primary/10 bg-primary/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary shadow-sm">
          Official Result Access Portal
        </div>

        <div className="mb-8 mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-white shadow-xl ring-1 ring-primary/10 md:h-36 md:w-36">
          <Image
            src="/logos.png"
            alt="Our logo"
            width={120}
            height={120}
            className="h-auto w-auto object-contain"
            priority
          />
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-primary md:text-5xl lg:text-6xl">
          College Entrance Test Result System
        </h1>

        <p className="mt-3 text-lg font-semibold tracking-wide text-foreground md:text-xl">
          Developed by Jaymar Maruji
        </p>

        <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base mx-auto">
          View official CET results online, access eligible program
          recommendations, and simplify result distribution by school year and
          exam schedule.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="rounded-full px-6 shadow-lg">
            <Link href="/student-login" className="inline-flex items-center gap-2">
              Student Result Access
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full border-primary/15 px-6"
          >
            <Link href="/admin/login">Admin Login</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}