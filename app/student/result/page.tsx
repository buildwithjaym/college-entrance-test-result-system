import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, CalendarDays, FileCheck2, School, UserRound } from "lucide-react"
import { PrintResultButton } from "@/components/student/print-result-button"
import { createAdminClient } from "@/lib/supabase/admin"

type SearchParams = Promise<{
  referenceNumber?: string
  lastName?: string
}>

function ResultState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-[2rem] border border-primary/10 bg-white/95 p-8 shadow-sm">
          <div className="mb-6">
            <Link
              href="/student-login"
              className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Result Access
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </main>
  )
}

function InfoCard({
  label,
  value,
  subtext,
}: {
  label: string
  value: string
  subtext?: string
}) {
  return (
    <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-foreground sm:text-base">
        {value}
      </p>
      {subtext ? (
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{subtext}</p>
      ) : null}
    </div>
  )
}

export default async function StudentResultPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams

  const referenceNumber = params.referenceNumber?.trim() || ""
  const lastName = params.lastName?.trim() || ""

  if (!referenceNumber || !lastName) {
    return (
      <ResultState
        title="Missing result lookup details"
        description="Please provide your reference number and last name to view your result."
      />
    )
  }

  const supabase = createAdminClient()

  const { data: applicant, error: applicantError } = await supabase
    .from("applicants")
    .select("id, reference_number, first_name, middle_name, last_name, email")
    .eq("reference_number", referenceNumber)
    .ilike("last_name", lastName)
    .maybeSingle()

  if (applicantError) {
    throw new Error(applicantError.message)
  }

  if (!applicant) {
    return (
      <ResultState
        title="No matching result found"
        description="We could not find a published result that matches the information you entered. Please check your reference number and last name, then try again."
      />
    )
  }

  const { data: result, error: resultError } = await supabase
    .from("results")
    .select(`
      id,
      overall_percentage,
      math_percentage,
      english_percentage,
      science_percentage,
      verbal_percentage,
      remarks,
      is_published,
      published_at,
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

  const schoolYear = Array.isArray(result.school_years)
    ? result.school_years[0]
    : result.school_years

  const schedule = Array.isArray(result.test_schedules)
    ? result.test_schedules[0]
    : result.test_schedules

  const fullName = [
    applicant.first_name,
    applicant.middle_name,
    applicant.last_name,
  ]
    .filter(Boolean)
    .join(" ")

  const subjectRows = [
    { label: "Mathematics", value: result.math_percentage },
    { label: "English", value: result.english_percentage },
    { label: "Science", value: result.science_percentage },
    { label: "Verbal", value: result.verbal_percentage },
  ].filter((item) => item.value !== null)

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 print:bg-white print:px-0">
      <div className="mx-auto max-w-5xl space-y-6 print:max-w-none">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
          <Link
            href="/student-login"
            className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <PrintResultButton />
        </div>

        <section className="overflow-hidden rounded-[2rem] border border-primary/10 bg-white/95 shadow-sm print:rounded-none print:border-0 print:shadow-none">
          <div className="border-b border-primary/10 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-8 sm:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-primary/10">
                  <Image
                    src="/logo.jpg"
                    alt="Basilan State College logo"
                    width={68}
                    height={68}
                    className="h-16 w-16 object-contain"
                    priority
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                    Basilan State College
                  </p>
                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    Official Result Slip
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Online Result Access System
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-primary/10 bg-white px-6 py-5 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  Overall Percentage
                </p>
                <p className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                  {Number(result.overall_percentage).toFixed(2)}%
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Official recorded result
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 px-6 py-8 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  Student Information
                </p>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <InfoCard label="Full Name" value={fullName} />
                  <InfoCard label="Reference Number" value={applicant.reference_number} />
                  <InfoCard
                    label="School Year"
                    value={schoolYear?.label ?? "Not available"}
                  />
                  <InfoCard
                    label="Exam Schedule"
                    value={schedule?.name ?? "Not available"}
                    subtext={
                      schedule?.exam_date
                        ? new Date(schedule.exam_date).toLocaleDateString("en-PH", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : undefined
                    }
                  />
                </div>
              </div>

              {subjectRows.length > 0 ? (
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                    Subject Breakdown
                  </p>

                  <div className="mt-4 overflow-hidden rounded-2xl border border-primary/10 bg-white">
                    <table className="w-full text-left">
                      <thead className="bg-primary/5">
                        <tr>
                          <th className="px-4 py-3 text-sm font-semibold text-muted-foreground">
                            Subject
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-muted-foreground">
                            Percentage
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {subjectRows.map((item) => (
                          <tr key={item.label} className="border-t border-primary/10">
                            <td className="px-4 py-3 text-sm font-medium text-foreground">
                              {item.label}
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-bold text-primary">
                              {Number(item.value).toFixed(2)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="space-y-5">
              <div className="rounded-3xl border border-primary/10 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  Result Status
                </p>

                <div className="mt-4 flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <FileCheck2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      Published Official Result
                    </p>
                    <p className="text-sm leading-6 text-muted-foreground">
                      This record is available for online viewing and download.
                    </p>
                  </div>
                </div>

                {result.published_at ? (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Published on{" "}
                    {new Date(result.published_at).toLocaleDateString("en-PH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                ) : null}
              </div>

              <div className="rounded-3xl border border-primary/10 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <UserRound className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                      Remarks
                    </p>
                    <p className="mt-1 text-sm leading-6 text-foreground">
                      {result.remarks || "No remarks provided."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-primary/10 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                      Important Note
                    </p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      This result is based on the official record published by the
                      testing center. Final admission and enrollment may still be
                      subject to institutional verification and other requirements.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-primary/10 bg-primary/5 p-5 print:hidden">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  Download Options
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  You may print this page directly or save it as a PDF using the
                  download button above.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}