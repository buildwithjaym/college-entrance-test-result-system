"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AdminLoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError("Invalid email or password.")
      setLoading(false)
      return
    }

    router.push("/admin/dashboard")
    router.refresh()
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(185,28,28,0.14),transparent_35%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,rgba(185,28,28,0.05),transparent,rgba(185,28,28,0.08))]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-10">
        <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-2">
          <div className="hidden flex-col justify-center rounded-3xl border border-primary/10 bg-primary/5 p-10 lg:flex">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
              <ShieldCheck className="h-8 w-8" />
            </div>

            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Administrator Access
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-tight text-foreground">
              Secure access for the testing center administration.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
              Manage school years, exam schedules, student records, results,
              publishing, and analytics inside a modern result management
              platform for SUC's.
            </p>

            <div className="mt-8 grid gap-4">
              <div className="rounded-2xl border border-primary/10 bg-background/80 p-4 shadow-sm">
                <p className="font-medium text-foreground">School-year-based management</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Organize results by school year and exam schedule with better
                  reporting and traceability.
                </p>
              </div>
              <div className="rounded-2xl border border-primary/10 bg-background/80 p-4 shadow-sm">
                <p className="font-medium text-foreground">Controlled result publishing</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Release official results only when the testing center is ready.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md rounded-3xl border border-primary/15 bg-background/95 shadow-2xl backdrop-blur">
              <CardHeader className="space-y-4 pb-2">
                <div className="flex items-center justify-between">
                  <Button asChild variant="ghost" size="sm" className="gap-2 rounded-full px-3">
                    <Link href="/">
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </Link>
                  </Button>

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
                    <LockKeyhole className="h-5 w-5" />
                  </div>
                </div>

                <div className="space-y-2 text-center">
                  <CardTitle className="text-3xl font-bold tracking-tight text-primary">
                    Admin Login
                  </CardTitle>
                  <CardDescription className="text-sm leading-6">
                    Sign in to access the CET Result System
                    administration panel.
                  </CardDescription>
                </div>
              </CardHeader>
                
                  {error ? (
  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
    {error}
  </div>
) : null}
              <CardContent className="pt-4">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@school.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 rounded-xl border-primary/10 bg-background shadow-sm focus-visible:ring-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 rounded-xl border-primary/10 bg-background shadow-sm focus-visible:ring-primary"
                    />
                  </div>


                  <Button
                    type="submit"
                    className="h-12 w-full rounded-xl bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign in to Dashboard"}
                  </Button>
                </form>

                <div className="mt-6 text-center text-xs leading-5 text-muted-foreground">
                  Authorized personnel only. All access activity may be monitored
                  for security and audit purposes.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}