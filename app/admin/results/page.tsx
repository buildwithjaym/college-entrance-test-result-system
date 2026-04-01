import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
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
    <main className="min-h-screen bg-slate-100 px-4 py-10 print:bg-white print:px-0 print:py-0">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-blue-200 bg-white p-8 shadow-sm print:border print:shadow-none">
          <div className="mb-6 print:hidden">
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

function formatDate(date?: string | null) {
  if (!date) return "Not available"

  return new Date(date).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
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

  const fullName = [applicant.last_name, applicant.first_name, applicant.middle_name]
    .filter(Boolean)
    .join(", ")

  return (
    <main className="min-h-screen bg-slate-100 px-3 py-6 sm:px-6 print:bg-white print:p-0">
      <div className="mx-auto max-w-6xl print:max-w-none">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
          <Link
            href="/student-login"
            className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <PrintResultButton />
        </div>

        <section className="bg-white p-2 shadow-sm sm:p-4 print:p-0 print:shadow-none">
          <div className="mx-auto aspect-[1.55/1] w-full max-w-[1120px] border-[4px] border-blue-700 p-2 print:max-w-none print:border-[3px]">
            <div className="flex h-full flex-col border-2 border-blue-300 px-3 py-4 sm:px-6 sm:py-5">
              <div className="grid grid-cols-[64px_1fr_64px] items-start gap-2 sm:grid-cols-[90px_1fr_90px] sm:gap-4">
                <div className="flex justify-start">
                  <Image
                    src="/logo.jpg"
                    alt="Basilan State College logo"
                    width={84}
                    height={84}
                    className="h-12 w-12 object-contain opacity-70 sm:h-20 sm:w-20"
                    priority
                  />
                </div>

                <div className="text-center">
                  <p className="text-[10px] leading-4 text-slate-700 sm:text-sm">
                    Republic of the Philippines
                  </p>
                  <p className="text-[10px] leading-4 text-slate-700 sm:text-sm">
                    Basilan State College
                  </p>
                  <p className="text-[10px] font-semibold uppercase leading-4 text-slate-800 sm:text-base">
                    Testing and Evaluation Center
                  </p>
                  <p className="text-[10px] leading-4 text-slate-700 sm:text-sm">
                    Isabela City, Basilan
                  </p>

                  <h1 className="mt-3 text-lg font-bold uppercase tracking-wide text-slate-800 sm:mt-4 sm:text-5xl">
                    College Entrance Test Result
                  </h1>

                  <p className="mt-1 text-[10px] text-slate-700 sm:text-sm">
                    School Year {schoolYear?.label ?? "Not available"}
                  </p>

                  <div className="mt-4 sm:mt-5">
                    <p className="text-xl font-bold uppercase leading-tight underline decoration-1 underline-offset-4 text-slate-900 sm:text-5xl">
                      {fullName}
                    </p>
                    <p className="mt-1 text-[10px] font-medium text-slate-700 sm:text-sm">
                      Examinee&apos;s Name
                    </p>
                  </div>

                  <div className="mt-5 sm:mt-7">
                    <p className="text-lg font-bold uppercase text-slate-800 sm:text-5xl">
                      Overall Ability Rating
                    </p>
                    <p className="mt-2 text-3xl font-extrabold tracking-tight text-red-600 sm:mt-4 sm:text-7xl">
                      {Number(result.overall_percentage).toFixed(2)}%
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Image
                    src="/logo.jpg"
                    alt="Basilan State College seal"
                    width={84}
                    height={84}
                    className="h-12 w-12 object-contain opacity-20 sm:h-20 sm:w-20"
                  />
                </div>
              </div>

              <div className="mt-auto grid gap-4 pt-5 text-[9px] text-slate-700 sm:grid-cols-2 sm:gap-8 sm:pt-8 sm:text-sm">
                <div className="space-y-1.5 sm:space-y-2">
                  <p>
                    <span className="font-semibold">Valid until:</span>{" "}
                    {schoolYear?.label ? `${schoolYear.label} only` : "Not available"}
                  </p>
                  <p>
                    <span className="font-semibold">Date of Examination:</span>{" "}
                    {formatDate(schedule?.exam_date)}
                  </p>
                  <p>
                    <span className="font-semibold">Reference Number:</span>{" "}
                    {applicant.reference_number}
                  </p>

                  {result.remarks ? (
                    <p>
                      <span className="font-semibold">Remarks:</span> {result.remarks}
                    </p>
                  ) : null}

                  <p className="pt-2 leading-4 text-slate-600 sm:leading-5">
                    Note: This CET result is subject to verification against the official
                    Testing and Evaluation Center masterlist. Any erasure or alteration
                    hereon nullifies this result.
                  </p>
                </div>

                <div className="flex items-end justify-start sm:justify-end">
                  <div className="w-full max-w-sm text-left sm:text-right">
                    <div className="mb-3 h-8 sm:mb-4 sm:h-10" />
                    <p className="text-[10px] font-semibold uppercase text-slate-800 sm:text-lg">
                      AL-BASSER S. SAPPAYANI, Ed. D, RGC
                    </p>
                    <p className="text-[9px] text-slate-700 sm:text-sm">Director, TEC</p>
                    <p className="text-[9px] text-slate-700 sm:text-sm">
                      R.A. 9258, PRC License # 0000876
                    </p>

                    {result.published_at ? (
                      <p className="mt-2 text-[9px] text-slate-500 sm:text-xs">
                        Published: {formatDate(result.published_at)}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}