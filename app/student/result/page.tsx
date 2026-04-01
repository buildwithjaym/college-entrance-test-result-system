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
    .select("id, reference_number, first_name, middle_name, last_name")
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

  const fullName = [applicant.last_name, applicant.first_name, applicant.middle_name]
    .filter(Boolean)
    .join(", ")

  const generatedAt = new Date().toISOString()

  return (
    <main className="min-h-screen bg-slate-200 px-3 py-6 sm:px-6 print:bg-white print:p-0">
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

        <section className="bg-white p-3 shadow-sm sm:p-4 print:p-0 print:shadow-none">
  <div
    id="result-slip"
    data-reference-number={applicant.reference_number}
    data-full-name={fullName}
    data-last-name={applicant.last_name}
    className="result-slip-small mx-auto w-full max-w-[760px] border-[2px] border-blue-700 bg-white p-[6px] print:max-w-none print:border-blue-700"
  >
    <div className="relative overflow-hidden border border-blue-300 bg-white px-4 py-3 sm:px-5 sm:py-4 print:border-blue-300 print:px-4 print:py-3">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.05]">
        <Image
          src="/logo.jpg"
          alt="Basilan State College watermark"
          width={220}
          height={220}
          unoptimized
          className="h-[120px] w-[120px] object-contain sm:h-[165px] sm:w-[165px]"
        />
      </div>

      <div className="relative z-10">
        <div className="grid grid-cols-[62px_1fr_62px] items-start gap-2 sm:grid-cols-[74px_1fr_74px] sm:gap-3">
          <div className="flex justify-start pt-1">
            <Image
              src="/logo.jpg"
              alt="Basilan State College logo"
              width={58}
              height={58}
              priority
              loading="eager"
              unoptimized
              className="block h-[46px] w-[46px] object-contain sm:h-[58px] sm:w-[58px]"
            />
          </div>

          <div className="text-center">
            <p className="text-[7px] leading-3 text-slate-700 sm:text-[9px]">
              Republic of the Philippines
            </p>
            <p className="text-[7px] leading-3 text-slate-700 sm:text-[9px]">
              Basilan State College
            </p>
            <p className="text-[7.5px] font-semibold uppercase leading-3 text-slate-900 sm:text-[10px]">
              Testing and Evaluation Center
            </p>
            <p className="text-[7px] leading-3 text-slate-700 sm:text-[9px]">
              Isabela City, Basilan
            </p>

            <h1 className="mt-2.5 text-[17px] font-bold uppercase leading-none tracking-wide text-slate-900 sm:mt-3 sm:text-[24px]">
              College Entrance Test Result
            </h1>

            <p className="mt-1 text-[8px] text-slate-700 sm:text-[10px]">
              School Year {schoolYear?.label ?? "Not available"}
            </p>

            <div className="mt-3.5 sm:mt-4">
              <p className="text-[19px] font-bold uppercase leading-tight underline decoration-[1px] underline-offset-2 text-slate-900 sm:text-[28px]">
                {fullName}
              </p>
              <p className="mt-1 text-[7px] text-slate-700 sm:text-[9px]">
                Examinee&apos;s Name
              </p>
            </div>

            <div className="mt-4 sm:mt-5">
              <p className="text-[19px] font-bold uppercase leading-none text-slate-900 sm:text-[30px]">
                Overall Ability Rating
              </p>
              <p className="mt-1.5 text-[36px] font-extrabold leading-none tracking-tight text-red-600 sm:mt-2 sm:text-[50px]">
                {Number(result.overall_percentage).toFixed(2)}%
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Image
              src="/testing.png"
              alt="Testing and Evaluation Center seal"
              width={58}
              height={58}
              priority
              loading="eager"
              unoptimized
              className="block h-[46px] w-[46px] object-contain sm:h-[58px] sm:w-[58px]"
            />
          </div>
        </div>

        <div className="mt-4 border-t border-blue-200 pt-3.5 sm:mt-5 sm:pt-4 print:border-blue-200">
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-1 text-[8px] leading-4 text-slate-800 sm:space-y-1.5 sm:text-[10px] sm:leading-5">
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

              <p className="pt-1 text-[7.5px] leading-4 text-slate-700 sm:text-[9px]">
                Note: This CET result is subject to verification against the
                official Testing and Evaluation Center masterlist. Any erasure
                or alteration hereon nullifies this result.
              </p>
            </div>

            <div className="flex items-end justify-end">
              <div className="max-w-[235px] text-right">
                <div className="mb-2 h-4 sm:mb-3 sm:h-5" />
                <p className="text-[10px] font-semibold uppercase leading-tight text-slate-900 sm:text-[12px]">
                  AL-BASSER S. SAPPAYANI, ED. D, RGC
                </p>
                <p className="text-[8px] text-slate-800 sm:text-[9px]">
                  Director, TEC
                </p>
                <p className="text-[8px] text-slate-800 sm:text-[9px]">
                  R.A. 9258, PRC License # 0000876
                </p>

                {result.published_at ? (
                  <p className="mt-1 text-[7px] text-slate-600 sm:text-[8px]">
                    Published: {formatDate(result.published_at)}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 border-t border-dashed border-blue-200 pt-2 print:border-blue-200">
          <div className="flex items-center justify-between text-[7px] text-slate-500 sm:text-[8px]">
            <p>
              Generated by{" "}
              <span className="font-semibold text-slate-700">
                BASC-CET-Result-System
              </span>
            </p>
            <p>
              Generated on{" "}
              <span className="font-medium text-slate-700">
                {formatDateTime(generatedAt)}
              </span>
            </p>
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