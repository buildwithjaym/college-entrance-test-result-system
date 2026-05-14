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
import {
  createVerificationUrl,
  ensureResultVerification,
} from "@/lib/result-verification"
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
    <main className="min-h-dvh bg-slate-100 px-3 py-3 sm:px-4 sm:py-4">
      <div className="mx-auto flex min-h-[calc(100dvh-1.5rem)] max-w-5xl items-center">
        <div className="w-full overflow-hidden rounded-[1.75rem] border border-red-100 bg-white shadow-sm sm:rounded-[2rem]">
          <div className="bg-gradient-to-br from-red-600 via-red-600 to-red-800 px-4 py-5 text-white sm:px-6 sm:py-7 md:px-8 md:py-8">
            <Link
              href="/student-login"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/15"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>

            <div className="mx-auto mt-6 flex max-w-2xl flex-col items-center text-center sm:mt-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20 sm:h-20 sm:w-20">
                <FileSearch className="h-8 w-8 sm:h-10 sm:w-10" />
              </div>

              <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.28em] text-red-100 sm:text-xs">
                Result Status
              </p>

              <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
                {title}
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-red-50 sm:text-base sm:leading-7">
                {description}
              </p>
            </div>
          </div>

          <div className="grid gap-3 p-4 sm:gap-4 sm:p-5 md:grid-cols-3 md:p-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <Clock3 className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm font-bold text-slate-950">
                Wait for release
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Results are shown only after the testing center officially
                publishes them.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm font-bold text-slate-950">
                Check again later
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                You can sign in again later using the same account to check for
                updates.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <HelpCircle className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm font-bold text-slate-950">
                Need help?
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Contact the testing office if your account or applicant record
                seems incorrect.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-200 px-4 py-4 text-center sm:px-5 sm:py-5">
            <Link
              href="/student-login"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-red-600 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-red-700"
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
      applicant_id,
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

  const overallScore = Number(result.overall_percentage)
  const overallPercentage = Number.isFinite(overallScore)
    ? overallScore.toFixed(2)
    : "0.00"

  const isQualified = Number.isFinite(overallScore) && overallScore >= 35
  const qualificationStatus = isQualified ? "QUALIFIER" : "NON-QUALIFIER"

  const formattedExamDate = formatDate(schedule?.exam_date)
  const formattedPublishedAt = result.published_at
    ? formatDate(result.published_at)
    : ""
  const formattedGeneratedAt = formatDateTime(new Date().toISOString())

  const verification = await ensureResultVerification({
    resultId: result.id,
    applicantId: result.applicant_id,
    overallPercentage: result.overall_percentage,
    publishedAt: result.published_at,
  })

  const verificationUrl = createVerificationUrl(verification.verification_token)
  const verificationCode = verification.verification_code

  const statusTheme = isQualified
    ? {
        card: "border-green-100",
        icon: "bg-green-50 text-green-700 ring-green-100",
        panel: "border-green-200 bg-green-50 text-green-800",
        helper: "text-green-700",
      }
    : {
        card: "border-red-100",
        icon: "bg-red-50 text-red-700 ring-red-100",
        panel: "border-red-200 bg-red-50 text-red-800",
        helper: "text-red-700",
      }

  return (
    <main className="min-h-screen bg-slate-200 px-3 py-4 sm:px-4 sm:py-6 md:px-6">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link
            href="/student-login"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-red-100 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <div className="flex shrink-0 items-center justify-end">
            <PrintResultButton />
          </div>
        </div>

        <div
          className={`mb-4 rounded-3xl border bg-white p-4 shadow-sm sm:p-5 ${statusTheme.card}`}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 ${statusTheme.icon}`}
              >
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-950">
                  Result unlocked
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Your official CET result is available for viewing and printing.
                </p>

                <p className={`mt-2 text-xs font-semibold ${statusTheme.helper}`}>
                  Passing mark: 35% and above.
                </p>
              </div>
            </div>

            <div
              className={`w-full rounded-2xl border px-4 py-3 text-center sm:px-5 lg:w-auto lg:min-w-[260px] ${statusTheme.panel}`}
            >
              <p className="text-[10px] font-extrabold uppercase tracking-[0.24em]">
                Qualification Status
              </p>

              <p className="mt-1 break-words text-2xl font-black uppercase leading-tight tracking-wide sm:text-3xl">
                {qualificationStatus}
              </p>
            </div>
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
              verificationUrl={verificationUrl}
              verificationCode={verificationCode}
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
            verificationUrl={verificationUrl}
            verificationCode={verificationCode}
            mode="export"
          />
        </div>
      </div>
    </main>
  )
}