"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  FileCheck2,
  FileSearch,
  FolderClock,
  GraduationCap,
  Loader2,
  XCircle,
} from "lucide-react"

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
import { createClient } from "@/lib/supabase/client"

type LoginStage = "idle" | "signing-in" | "checking-result" | "no-result"

const checkingMessages = [
  "Verifying your student account...",
  "Finding your CET record...",
  "Checking if your result has been released...",
  "Getting the latest update from the testing center...",
  "Preparing your result access...",
]

export default function StudentLoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [stage, setStage] = useState<LoginStage>("idle")
  const [messageIndex, setMessageIndex] = useState(0)
  const [toast, setToast] = useState<{
    type: "success" | "error" | "info"
    message: string
  } | null>(null)

  const loading = stage === "signing-in" || stage === "checking-result"

  useEffect(() => {
    if (stage !== "checking-result") return

    const interval = window.setInterval(() => {
      setMessageIndex((index) => (index + 1) % checkingMessages.length)
    }, 1400)

    return () => window.clearInterval(interval)
  }, [stage])

  function showToast(type: "success" | "error" | "info", message: string) {
    setToast({ type, message })
    window.setTimeout(() => setToast(null), 3500)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const normalizedEmail = email.trim().toLowerCase()
    const trimmedPassword = password.trim()

    if (!normalizedEmail || !trimmedPassword) {
      showToast("error", "Please enter your email and password.")
      return
    }

    setStage("signing-in")
    showToast("info", "Signing in securely...")

    try {
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: trimmedPassword,
        })

      if (signInError || !signInData.user) {
        setStage("idle")
        showToast("error", "Invalid email or password.")
        return
      }

      setStage("checking-result")
      showToast("success", "Login successful. Checking your result...")

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, must_change_password")
        .eq("id", signInData.user.id)
        .single()

      if (profileError || !profile || profile.role !== "applicant") {
        await supabase.auth.signOut()
        setStage("idle")
        showToast("error", "This account is not allowed to access student results.")
        return
      }

      if (profile.must_change_password) {
        router.replace("/change-password")
        return
      }

      const { data: applicant, error: applicantError } = await supabase
        .from("applicants")
        .select("id")
        .eq("email", normalizedEmail)
        .maybeSingle()

      if (applicantError || !applicant) {
        setStage("no-result")
        showToast("info", "No result record is linked to this account yet.")
        return
      }

      const { data: result, error: resultError } = await supabase
        .from("results")
        .select("id, is_published")
        .eq("applicant_id", applicant.id)
        .eq("is_published", true)
        .maybeSingle()

      if (resultError || !result) {
        setStage("no-result")
        showToast("info", "Your result is not yet available.")
        return
      }

      showToast("success", "Your result is ready. Opening now...")
      router.replace("/student/result")
    } catch {
      setStage("idle")
      showToast("error", "Something went wrong. Please try again.")
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <style jsx global>{`
        @keyframes floatAlive {
          0% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-10px) scale(1.04);
          }
          100% {
            transform: translateY(0) scale(1);
          }
        }

        @keyframes progressAlive {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(15%);
          }
          100% {
            transform: translateX(120%);
          }
        }

        @keyframes glowAlive {
          0%, 100% {
            opacity: 0.35;
            transform: scale(1);
          }
          50% {
            opacity: 0.75;
            transform: scale(1.15);
          }
        }
      `}</style>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(185,28,28,0.14),transparent_35%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom_left,rgba(185,28,28,0.05),transparent,rgba(185,28,28,0.08))]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        {stage === "checking-result" ? (
          <Card className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-primary/15 bg-background/95 p-8 text-center shadow-2xl backdrop-blur">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute left-10 top-10 h-3 w-3 rounded-full bg-primary/40 [animation:glowAlive_1.8s_ease-in-out_infinite]" />
              <div className="absolute right-12 top-20 h-2 w-2 rounded-full bg-primary/30 [animation:glowAlive_2.2s_ease-in-out_infinite]" />
              <div className="absolute bottom-14 left-16 h-2.5 w-2.5 rounded-full bg-primary/30 [animation:glowAlive_2s_ease-in-out_infinite]" />
              <div className="absolute bottom-20 right-20 h-2 w-2 rounded-full bg-primary/40 [animation:glowAlive_2.4s_ease-in-out_infinite]" />
            </div>

            <div className="relative mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-red-50 shadow-inner">
              <div className="absolute inset-0 rounded-full bg-primary/10 [animation:glowAlive_1.8s_ease-in-out_infinite]" />
              <FileSearch className="relative h-16 w-16 text-primary [animation:floatAlive_2.4s_ease-in-out_infinite]" />
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
              <CheckCircle2 className="h-4 w-4" />
              Login successful
            </div>

            <h1 className="mt-4 text-2xl font-bold text-foreground">
              Checking your result...
            </h1>

            <p className="mt-3 min-h-[48px] text-sm leading-6 text-muted-foreground transition-all">
              {checkingMessages[messageIndex]}
            </p>

            <div className="mx-auto mt-7 h-3 w-full max-w-xs overflow-hidden rounded-full bg-red-100">
              <div className="h-full w-2/3 rounded-full bg-primary [animation:progressAlive_1.5s_ease-in-out_infinite]" />
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2 text-xs font-semibold">
              <div className="rounded-full bg-green-50 px-3 py-2 text-green-700">
                Signed in
              </div>
              <div className="rounded-full bg-red-50 px-3 py-2 text-primary">
                Checking
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-2 text-slate-500">
                Opening
              </div>
            </div>
          </Card>
        ) : stage === "no-result" ? (
          <Card className="w-full max-w-lg rounded-[2rem] border border-primary/15 bg-background/95 p-8 text-center shadow-2xl backdrop-blur">
            <div className="flex justify-start">
              <Button asChild variant="ghost" size="sm" className="gap-2 rounded-full px-3">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Link>
              </Button>
            </div>

            <div className="mx-auto mt-6 flex h-32 w-32 items-center justify-center rounded-full bg-blue-50">
              <FolderClock className="h-16 w-16 text-blue-700 [animation:floatAlive_2.6s_ease-in-out_infinite]" />
            </div>

            <p className="mt-8 text-xs font-bold uppercase tracking-[0.25em] text-blue-700">
              Result Access
            </p>

            <h1 className="mt-3 text-2xl font-bold text-foreground">
              Result not yet available
            </h1>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Your result may still be under review or not yet published by the
              testing center. Please check again later.
            </p>

            <Button
              type="button"
              onClick={() => setStage("idle")}
              className="mt-8 h-11 rounded-xl bg-primary px-6 text-primary-foreground"
            >
              Back to login
            </Button>
          </Card>
        ) : (
          <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-2">
            <div className="hidden flex-col justify-center rounded-3xl border border-primary/10 bg-primary/5 p-10 lg:flex">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                <GraduationCap className="h-8 w-8" />
              </div>

              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                Student Result Portal
              </p>

              <h1 className="mt-3 text-4xl font-bold leading-tight text-foreground">
                View your CET result securely and privately online.
              </h1>

              <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
                Sign in using your registered email and password. The system
                will automatically check if your result is already available.
              </p>

              <div className="mt-8 grid gap-4">
                <div className="rounded-2xl border border-primary/10 bg-background/80 p-4 shadow-sm">
                  <p className="font-medium text-foreground">Private access</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your result is only available after successful account login.
                  </p>
                </div>

                <div className="rounded-2xl border border-primary/10 bg-background/80 p-4 shadow-sm">
                  <p className="font-medium text-foreground">
                    Automatic result checking
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    After login, we check if your result is already released.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <Card className="w-full max-w-lg rounded-3xl border border-primary/15 bg-background/95 shadow-2xl backdrop-blur">
                <CardHeader className="space-y-4 pb-2">
                  <div className="flex items-center justify-between">
                    <Button asChild variant="ghost" size="sm" className="gap-2 rounded-full px-3">
                      <Link href="/">
                        <ArrowLeft className="h-4 w-4" />
                        Back
                      </Link>
                    </Button>

                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
                      <FileCheck2 className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="space-y-2 text-center">
                    <CardTitle className="text-3xl font-bold tracking-tight text-primary">
                      Student Login
                    </CardTitle>
                    <CardDescription className="text-sm leading-6">
                      Sign in with your registered email and password to access
                      your CET result.
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="pt-4">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your registered email"
                        required
                        disabled={loading}
                        autoComplete="email"
                        className="h-12 rounded-xl border-primary/10 bg-background shadow-sm focus-visible:ring-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <Label htmlFor="password">Password</Label>
                        <Link
                          href="/forgot-password"
                          className="text-sm font-medium text-primary transition hover:underline"
                        >
                          Forgot your password?
                        </Link>
                      </div>

                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          required
                          disabled={loading}
                          autoComplete="current-password"
                          className="h-12 rounded-xl border-primary/10 bg-background pr-12 shadow-sm focus-visible:ring-primary"
                        />

                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          disabled={loading}
                          className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center justify-center text-muted-foreground transition hover:text-foreground disabled:opacity-60"
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
                      className="h-12 w-full rounded-xl bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>

                  <div className="mt-6 text-center text-xs leading-5 text-muted-foreground">
                    After login, the system will check if your result has already
                    been released.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 w-[calc(100%-2.5rem)] max-w-sm">
          <div
            className={
              toast.type === "success"
                ? "flex items-start gap-3 rounded-2xl border border-green-200 bg-white p-4 text-green-800 shadow-2xl"
                : toast.type === "info"
                  ? "flex items-start gap-3 rounded-2xl border border-blue-200 bg-white p-4 text-blue-800 shadow-2xl"
                  : "flex items-start gap-3 rounded-2xl border border-red-200 bg-white p-4 text-red-800 shadow-2xl"
            }
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            ) : toast.type === "info" ? (
              <FileSearch className="mt-0.5 h-5 w-5 shrink-0" />
            ) : (
              <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
            )}

            <p className="text-sm font-semibold">{toast.message}</p>
          </div>
        </div>
      ) : null}
    </main>
  )
}