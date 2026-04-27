import Link from "next/link"
import { redirect } from "next/navigation"
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileSearch,
  HelpCircle,
  ShieldCheck,
} from "lucide-react"

import { PrintResultButton } from "@/components/student/print-result-button"
import { ResultSheet } from "@/components/student/result-sheet"
import { createClient } from "@/lib/supabase/server"

function formatDate(date?: string | null) {
  if (!date) return "Not available"

  return new Date(date).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function formatDateTime(date?: string | null) {
  if (!date) return "Not available"

  return new Date(date).toLocaleString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function getSingleRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null
  return Array.isArray(value) ? (value[0] ?? null) : value
}

function ResultState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-sm">
          <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 p-6 text-white sm:p-8">
            <Link
              href="/student-login"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/15"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>

            <div className="mt-8 flex flex-col items-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
                <FileSearch className="h-12 w-12 animate-pulse" />
              </div>

              <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-blue-100">
                Result Status
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                {title}
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-7 text-blue-50">
                {description}
              </p>
            </div>
          </div>

          <div className="grid gap-4 p-5 sm:p-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <Clock3 className="h-5 w-5 text-blue-700" />
              <p className="mt-3 text-sm font-bold text-slate-900">
                Wait for release
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Results are shown only after the testing center officially
                publishes them.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <CheckCircle2 className="h-5 w-5 text-green-700" />
              <p className="mt-3 text-sm font-bold text-slate-900">
                Check again later
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                You can sign in again later using the same account to check for
                updates.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <HelpCircle className="h-5 w-5 text-amber-700" />
              <p className="mt-3 text-sm font-bold text-slate-900">
                Need help?
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Contact the testing office if your account or applicant record
                seems incorrect.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-200 p-5 text-center sm:p-6">
            <Link
              href="/student-login"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-700 px-6 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              Return to login
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default async function StudentResultPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/student-login")
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, must_change_password")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) {
    redirect("/student-login")
  }

  if (profile.role !== "applicant") {
    redirect("/student-login")
  }

  if (profile.must_change_password) {
    redirect("/change-password")
  }

  const { data: applicant, error: applicantError } = await supabase
    .from("applicants")
    .select("id, reference_number, first_name, middle_name, last_name, email")
    .eq("user_id", user.id)
    .single()

  if (applicantError) {
    throw new Error(applicantError.message)
  }

  if (!applicant) {
    return (
      <ResultState
        title="Applicant record not found"
        description="We could not find your applicant account details. Please contact the testing office for assistance."
      />
    )
  }

  const { data: result, error: resultError } = await supabase
    .from("results")
    .select(`
      id,
      overall_percentage,
      remarks,
      is_published,
      published_at,
      created_at,
      school_years (
        id,
        label
      ),
      test_schedules (
        id,
        name,
        exam_date
      )
    `)
    .eq("applicant_id", applicant.id)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .maybeSingle()

  if (resultError) {
    throw new Error(resultError.message)
  }

  if (!result) {
    return (
      <ResultState
        title="Result not yet available"
        description="Your result may still be under review or not yet published by the testing center. Please check again later."
      />
    )
  }

  const schoolYear = getSingleRelation(result.school_years)
  const schedule = getSingleRelation(result.test_schedules)

  const fullName = [
    applicant.last_name,
    applicant.first_name,
    applicant.middle_name,
  ]
    .filter(Boolean)
    .join(", ")

  const generatedAt = new Date().toISOString()
  const formattedExamDate = formatDate(schedule?.exam_date)
  const formattedPublishedAt = result.published_at
    ? formatDate(result.published_at)
    : ""
  const formattedGeneratedAt = formatDateTime(generatedAt)
  const overallPercentage = Number(result.overall_percentage).toFixed(2)

  return (
    <main className="min-h-screen bg-slate-200 px-3 py-4 sm:px-4 sm:py-6 md:px-6">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-4 flex items-center justify-between gap-2">
          <Link
            href="/student-login"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <div className="flex shrink-0 items-center justify-end">
            <PrintResultButton />
          </div>
        </div>

        <div className="mb-4 rounded-3xl border border-green-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-green-700 ring-1 ring-green-100">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-950">
                  Result unlocked
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Your official CET result is available for viewing and printing.
                </p>
              </div>
            </div>

            <span className="w-fit rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
              Published
            </span>
          </div>
        </div>

        <section className="animate-[resultReveal_0.45s_ease-out] rounded-3xl bg-white p-3 shadow-sm sm:p-5 md:p-6">
          <div className="mx-auto w-full max-w-md md:max-w-[1180px]">
            <ResultSheet
              referenceNumber={applicant.reference_number}
              fullName={fullName}
              lastName={applicant.last_name}
              schoolYearLabel={schoolYear?.label}
              overallPercentage={overallPercentage}
              formattedExamDate={formattedExamDate}
              remarks={result.remarks}
              formattedPublishedAt={formattedPublishedAt}
              formattedGeneratedAt={formattedGeneratedAt}
              mode="preview"
            />
          </div>
        </section>

        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            left: "-99999px",
            top: 0,
            opacity: 0,
            pointerEvents: "none",
          }}
        >
          <ResultSheet
            referenceNumber={applicant.reference_number}
            fullName={fullName}
            lastName={applicant.last_name}
            schoolYearLabel={schoolYear?.label}
            overallPercentage={overallPercentage}
            formattedExamDate={formattedExamDate}
            remarks={result.remarks}
            formattedPublishedAt={formattedPublishedAt}
            formattedGeneratedAt={formattedGeneratedAt}
            mode="export"
          />
        </div>
      </div>
    </main>
  )
}