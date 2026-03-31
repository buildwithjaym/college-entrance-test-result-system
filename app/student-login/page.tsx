"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, GraduationCap, FileCheck2 } from "lucide-react"
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

export default function StudentLoginPage() {
  const router = useRouter()

  const [referenceNumber, setReferenceNumber] = useState("")
  const [lastName, setLastName] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const params = new URLSearchParams({
      referenceNumber,
      lastName,
    })

    router.push(`/student/result?${params.toString()}`)
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(185,28,28,0.14),transparent_35%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom_left,rgba(185,28,28,0.05),transparent,rgba(185,28,28,0.08))]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-10">
        <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-2">
          <div className="hidden flex-col justify-center rounded-3xl border border-primary/10 bg-primary/5 p-10 lg:flex">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
              <GraduationCap className="h-8 w-8" />
            </div>

            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Student Result Portal
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-tight text-foreground">
              View your CET result quickly, securely, and online.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
              Access your official result, check your overall percentage, and
              see your eligible program recommendations for the current school
              year and exam schedule.
            </p>

            <div className="mt-8 grid gap-4">
              <div className="rounded-2xl border border-primary/10 bg-background/80 p-4 shadow-sm">
                <p className="font-medium text-foreground">Fast result access</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  No need to visit the testing center just to verify your result.
                </p>
              </div>
              <div className="rounded-2xl border border-primary/10 bg-background/80 p-4 shadow-sm">
                <p className="font-medium text-foreground">Recommendation-ready</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  See qualified or eligible programs based on your recorded result.
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
                    Student Result Access
                  </CardTitle>
                  <CardDescription className="text-sm leading-6">
                    Enter your details below to securely view your CET result and
                    recommendations.
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="referenceNumber" className="text-sm font-medium">
                      Reference Number
                    </Label>
                    <Input
                      id="referenceNumber"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      placeholder="Enter your reference number"
                      required
                      className="h-12 rounded-xl border-primary/10 bg-background shadow-sm focus-visible:ring-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter your last name"
                      required
                      className="h-12 rounded-xl border-primary/10 bg-background shadow-sm focus-visible:ring-primary"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="h-12 w-full rounded-xl bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
                    disabled={loading}
                  >
                    {loading ? "Checking..." : "View My Result"}
                  </Button>
                </form>

                <div className="mt-6 text-center text-xs leading-5 text-muted-foreground">
                  Please make sure your information matches the details submitted
                  during your CET application.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}