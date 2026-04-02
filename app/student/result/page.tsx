import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
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
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-blue-200 bg-white p-8 shadow-sm">
          <div className="mb-6">
            <Link
              href="/student-login"
              className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
            Result Access
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
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
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link
            href="/student-login"
            className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <PrintResultButton />
        </div>

        <section className="rounded-3xl bg-white p-3 shadow-sm sm:p-5 md:p-6">
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