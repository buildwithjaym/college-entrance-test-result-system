"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, KeyRound, Loader2, Mail, ShieldCheck } from "lucide-react"
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

export default function ForgotPasswordPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail) {
      setErrorMessage("Please enter your registered email address.")
      return
    }

    setLoading(true)
    setErrorMessage("")
    setSuccessMessage("")

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: normalizedEmail }),
      })

      const result = await response.json()

      if (!response.ok) {
        setErrorMessage(
          result?.message ||
            "Unable to process your request right now. Please try again."
        )
        return
      }

      setSuccessMessage(
        "If the email is registered, a one-time password has been sent. Redirecting..."
      )

      setTimeout(() => {
        router.push(
          `/reset-password?email=${encodeURIComponent(normalizedEmail)}`
        )
      }, 1200)
    } catch {
      setErrorMessage("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(185,28,28,0.14),transparent_35%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom_left,rgba(185,28,28,0.05),transparent,rgba(185,28,28,0.08))]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-10">
        <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-2">
          <div className="hidden flex-col justify-center rounded-3xl border border-primary/10 bg-primary/5 p-10 lg:flex">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
              <Mail className="h-8 w-8" />
            </div>

            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Password Recovery
            </p>

            <h1 className="mt-3 text-4xl font-bold leading-tight text-foreground">
              Reset your student account password securely.
            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
              Enter your registered email address and we will send a one-time
              password to help you recover access to your CET Result account.
            </p>

            <div className="mt-8 grid gap-4">
              <div className="rounded-2xl border border-primary/10 bg-background/80 p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-xl bg-primary/10 p-2 text-primary">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      Secure verification
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      A one-time password will be sent to your registered email
                      for password reset verification.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-primary/10 bg-background/80 p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-xl bg-primary/10 p-2 text-primary">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      Fast account recovery
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Once verified, you can immediately create a new password
                      and return to your result portal.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <Card className="w-full max-w-lg rounded-3xl border border-primary/15 bg-background/95 shadow-2xl backdrop-blur">
              <CardHeader className="space-y-4 pb-2">
                <div className="flex items-center justify-between">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="gap-2 rounded-full px-3"
                  >
                    <Link href="/student-login">
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </Link>
                  </Button>

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
                    <KeyRound className="h-5 w-5" />
                  </div>
                </div>

                <div className="space-y-2 text-center">
                  <CardTitle className="text-3xl font-bold tracking-tight text-primary">
                    Forgot Password
                  </CardTitle>
                  <CardDescription className="text-sm leading-6">
                    Enter your registered email to receive your one-time
                    password.
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your registered email"
                      required
                      disabled={loading}
                      className="h-12 rounded-xl border-primary/10 bg-background shadow-sm focus-visible:ring-primary"
                    />
                  </div>

                  {errorMessage ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {errorMessage}
                    </div>
                  ) : null}

                  {successMessage ? (
                    <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                      {successMessage}
                    </div>
                  ) : null}

                  <Button
                    type="submit"
                    className="h-12 w-full rounded-xl bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      "Send OTP"
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center text-xs leading-5 text-muted-foreground">
                  For security, we will not confirm whether an email is
                  registered in the system.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}