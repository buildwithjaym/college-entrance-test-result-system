"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  KeyRound,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
  Mail,
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

type ResetPasswordFormProps = {
  email: string
}

export default function ResetPasswordForm({
  email,
}: ResetPasswordFormProps) {
  const router = useRouter()

  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const trimmedOtp = otp.trim()
    const trimmedNewPassword = newPassword.trim()
    const trimmedConfirmPassword = confirmPassword.trim()

    setErrorMessage("")
    setSuccessMessage("")

    if (!trimmedOtp || !trimmedNewPassword || !trimmedConfirmPassword) {
      setErrorMessage("Please complete all required fields.")
      return
    }

    if (trimmedOtp.length !== 6) {
      setErrorMessage("Please enter the 6-digit OTP sent to your email.")
      return
    }

    if (trimmedNewPassword.length < 8) {
      setErrorMessage("Your new password must be at least 8 characters long.")
      return
    }

    if (trimmedNewPassword !== trimmedConfirmPassword) {
      setErrorMessage("Your new password and confirm password do not match.")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp: trimmedOtp,
          newPassword: trimmedNewPassword,
        }),
      })

      const result = await response.json().catch(() => null)

      if (!response.ok) {
        setErrorMessage(
          result?.message ||
            "Unable to reset your password right now. Please try again."
        )
        return
      }

      setSuccessMessage(
        "Your password has been reset successfully. Redirecting to login..."
      )

      setTimeout(() => {
        router.replace("/student-login")
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
              <ShieldCheck className="h-8 w-8" />
            </div>

            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Password Reset
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-tight text-foreground">
              Verify your OTP and create a new password.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
              Enter the one-time password sent to your registered email, then set
              your new password to recover access to your student account.
            </p>

            <div className="mt-8 grid gap-4">
              <div className="rounded-2xl border border-primary/10 bg-background/80 p-4 shadow-sm">
                <p className="font-medium text-foreground">Email locked</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  This reset session is already tied to the email address from
                  the previous step.
                </p>
              </div>

              <div className="rounded-2xl border border-primary/10 bg-background/80 p-4 shadow-sm">
                <p className="font-medium text-foreground">Secure completion</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Once your OTP is confirmed, your new password will immediately
                  replace the old one.
                </p>
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
                    <Link href="/forgot-password">
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
                    Reset Password
                  </CardTitle>
                  <CardDescription className="text-sm leading-6">
                    Enter the OTP and set your new password to continue.
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-primary/10 p-2 text-primary">
                        <Mail className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                          Reset Email
                        </p>
                        <p className="mt-1 truncate text-sm font-medium text-foreground">
                          {email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-sm font-medium">
                      OTP
                    </Label>
                    <Input
                      id="otp"
                      inputMode="numeric"
                      maxLength={6}
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      placeholder="Enter 6-digit OTP"
                      required
                      disabled={loading}
                      className="h-12 rounded-xl border-primary/10 bg-background shadow-sm focus-visible:ring-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-sm font-medium">
                      New Password
                    </Label>

                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter your new password"
                        required
                        disabled={loading}
                        className="h-12 rounded-xl border-primary/10 bg-background pr-12 shadow-sm focus-visible:ring-primary"
                      />

                      <button
                        type="button"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        disabled={loading}
                        className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center justify-center text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Minimum of 8 characters.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirm Password
                    </Label>

                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your new password"
                        required
                        disabled={loading}
                        className="h-12 rounded-xl border-primary/10 bg-background pr-12 shadow-sm focus-visible:ring-primary"
                      />

                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        disabled={loading}
                        className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center justify-center text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
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
                        Resetting...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center text-xs leading-5 text-muted-foreground">
                  Enter the OTP sent to your email within 10 minutes to complete
                  your password reset.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}