import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Home",
  description:
    "Access official College Entrance Test results, check program recommendations, and view school-year-based exam result information.",
}

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <section className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center py-10 text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-primary shadow-sm">
          <ShieldCheck className="h-3.5 w-3.5" />
          Official Result Access Portal
        </div>

        <div className="mb-7 flex h-28 w-28 items-center justify-center rounded-full bg-white shadow-xl ring-1 ring-primary/10 sm:h-32 sm:w-32">
          <Image
            src="/logos.png"
            alt="Testing center logo"
            width={110}
            height={110}
            className="h-auto w-auto object-contain"
            priority
          />
        </div>

        <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-primary sm:text-5xl lg:text-6xl">
          College Entrance Test Result System
        </h1>

        <p className="mt-3 text-base font-semibold tracking-wide text-foreground sm:text-lg">
          Developed by Jaymar Maruji
        </p>

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
          View official CET results online, access eligible program
          recommendations, and simplify result distribution by school year and
          exam schedule.
        </p>

        <div className="mt-9 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="h-12 rounded-full px-6 shadow-lg">
            <Link
              href="/student-login"
              className="inline-flex items-center justify-center gap-2"
            >
              Student Result Access
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 rounded-full border-primary/15 px-6"
          >
            <Link href="/admin/login">Admin Login</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}