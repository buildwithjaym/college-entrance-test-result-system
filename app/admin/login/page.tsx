"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  XCircle,
} from "lucide-react"

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
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message })
    window.setTimeout(() => setToast(null), 3500)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!email.trim() || !password.trim()) {
      showToast("error", "Please enter your email and password.")
      return
    }

    setLoading(true)
    showToast("success", "Checking your admin credentials...")

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      setLoading(false)
      showToast("error", "Invalid email or password.")
      return
    }

    showToast("success", "Login successful. Redirecting to dashboard...")

    router.push("/admin/dashboard")
    router.refresh()
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(185,28,28,0.14),transparent_35%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,rgba(185,28,28,0.05),transparent,rgba(185,28,28,0.08))]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          <section className="hidden flex-col justify-center rounded-[2rem] border border-primary/10 bg-primary/5 p-8 lg:flex xl:p-10">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
              <ShieldCheck className="h-8 w-8" />
            </div>

            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Administrator Access
            </p>

            <h1 className="mt-3 text-3xl font-bold leading-tight text-foreground xl:text-4xl">
              Secure access for CET result administration.
            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
              Manage school years, exam schedules, applicants, result records,
              publishing, and analytics from one admin workspace.
            </p>

            <div className="mt-8 grid gap-4">
              <div className="rounded-2xl border border-primary/10 bg-background/80 p-4 shadow-sm">
                <p className="font-medium text-foreground">
                  Fast result management
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Review, filter, release, and monitor CET results with a cleaner
                  workflow.
                </p>
              </div>

              <div className="rounded-2xl border border-primary/10 bg-background/80 p-4 shadow-sm">
                <p className="font-medium text-foreground">
                  Controlled publishing
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Release official results only when the testing center is ready.
                </p>
              </div>
            </div>
          </section>

          <section className="flex items-center justify-center">
            <Card className="w-full max-w-md rounded-[2rem] border border-primary/15 bg-background/95 shadow-2xl backdrop-blur">
              <CardHeader className="space-y-4 pb-2">
                <div className="flex items-center justify-between">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="gap-2 rounded-full px-3"
                  >
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
                  <CardTitle className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
                    Admin Login
                  </CardTitle>
                  <CardDescription className="text-sm leading-6">
                    Sign in to access the CET Result System administration
                    panel.
                  </CardDescription>
                </div>
              </CardHeader>

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
                      autoComplete="email"
                      required
                      disabled={loading}
                      className="h-12 rounded-xl border-primary/10 bg-background shadow-sm focus-visible:ring-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>

                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                        disabled={loading}
                        className="h-12 rounded-xl border-primary/10 bg-background pr-12 shadow-sm focus-visible:ring-primary"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        disabled={loading}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-60"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="h-12 w-full rounded-xl bg-primary text-primary-foreground shadow-lg transition hover:bg-primary/90"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing in...
                      </span>
                    ) : (
                      "Sign in to Dashboard"
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center text-xs leading-5 text-muted-foreground">
                  Authorized personnel only. All access activity may be monitored
                  for security and audit purposes.
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>

      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 w-[calc(100%-2.5rem)] max-w-sm">
          <div
            className={
              toast.type === "success"
                ? "flex items-start gap-3 rounded-2xl border border-green-200 bg-white p-4 text-green-800 shadow-2xl"
                : "flex items-start gap-3 rounded-2xl border border-red-200 bg-white p-4 text-red-800 shadow-2xl"
            }
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            ) : (
              <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
            )}

            <div className="min-w-0">
              <p className="text-sm font-bold">
                {toast.type === "success" ? "Success" : "Login failed"}
              </p>
              <p className="mt-1 text-sm">{toast.message}</p>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}