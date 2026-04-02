"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, KeyRound, Loader2, ShieldCheck } from "lucide-react"
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

export default function ChangePasswordPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loadingPage, setLoadingPage] = useState(true)
  const [saving, setSaving] = useState(false)

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    let mounted = true

    async function checkAccess() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          router.replace("/student-login")
          return
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role, must_change_password")
          .eq("id", user.id)
          .single()

        if (profileError || !profile) {
          await supabase.auth.signOut()
          router.replace("/student-login")
          return
        }

        if (profile.role !== "applicant") {
          await supabase.auth.signOut()
          router.replace("/student-login")
          return
        }

        if (!profile.must_change_password) {
          router.replace("/student/result")
          return
        }

        if (mounted) {
          setLoadingPage(false)
        }
      } catch {
        router.replace("/student-login")
      }
    }

    checkAccess()

    return () => {
      mounted = false
    }
  }, [router, supabase])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const trimmedNewPassword = newPassword.trim()
    const trimmedConfirmPassword = confirmPassword.trim()

    setErrorMessage("")
    setSuccessMessage("")

    if (!trimmedNewPassword || !trimmedConfirmPassword) {
      setErrorMessage("Please fill in both password fields.")
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

    setSaving(true)

    try {
      const {
        data: { user },
        error: getUserError,
      } = await supabase.auth.getUser()

      if (getUserError || !user) {
        setErrorMessage("Your session has expired. Please sign in again.")
        router.replace("/student-login")
        return
      }

      const { error: updateAuthError } = await supabase.auth.updateUser({
        password: trimmedNewPassword,
      })

      if (updateAuthError) {
        setErrorMessage(
          "Unable to update your password right now. Please try again."
        )
        return
      }

      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update({ must_change_password: false })
        .eq("id", user.id)

      if (profileUpdateError) {
        setErrorMessage(
          "Your password was updated, but we could not finish setup. Please sign in again."
        )
        return
      }

      setSuccessMessage("Password updated successfully. Redirecting...")
      setTimeout(() => {
        router.replace("/student/result")
      }, 1000)
    } catch {
      setErrorMessage("Something went wrong. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (loadingPage) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Checking your account...
        </div>
      </main>
    )
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
              First Login Security
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-tight text-foreground">
              Create a new password before viewing your result.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
              For your privacy and security, you must replace your temporary
              password before accessing your CET result.
            </p>

            <div className="mt-8 grid gap-4">
              <div className="rounded-2xl border border-primary/10 bg-background/80 p-4 shadow-sm">
                <p className="font-medium text-foreground">Secure access</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your result stays private under your own updated password.
                </p>
              </div>
              <div className="rounded-2xl border border-primary/10 bg-background/80 p-4 shadow-sm">
                <p className="font-medium text-foreground">One-time setup</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  You only need to do this once on your first successful login.
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
                    Change Password
                  </CardTitle>
                  <CardDescription className="text-sm leading-6">
                    Set your new password to continue to your private student
                    result page.
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-sm font-medium">
                      New Password
                    </Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter your new password"
                      required
                      disabled={saving}
                      className="h-12 rounded-xl border-primary/10 bg-background shadow-sm focus-visible:ring-primary"
                    />
                    <p className="text-xs text-muted-foreground">
                      Minimum of 8 characters.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-sm font-medium"
                    >
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your new password"
                      required
                      disabled={saving}
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
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center text-xs leading-5 text-muted-foreground">
                  After your password is updated successfully, you will be
                  redirected to your result page.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}