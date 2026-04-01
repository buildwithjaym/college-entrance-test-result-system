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
    <main className="min-h-screen bg-slate-200 px-2 py-4 sm:px-4 sm:py-6">
      <div className="mx-auto max-w-6xl">
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

        {/* Screen layout: responsive, can look portrait-ish on mobile */}
        <section className="bg-white p-2 shadow-sm sm:p-4">
          <div className="mx-auto max-w-[920px] overflow-x-auto">
            <div
              id="result-slip"
              data-reference-number={applicant.reference_number}
              data-full-name={fullName}
              data-last-name={applicant.last_name}
              className="result-slip-screen mx-auto border-2 border-blue-700 bg-white p-2"
            >
              <div className="relative overflow-hidden border border-blue-300 bg-white px-3 py-3 sm:px-5 sm:py-4">
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.05]">
                  <Image
                    src="/logo.jpg"
                    alt="Basilan State College watermark"
                    width={220}
                    height={220}
                    unoptimized
                    style={{ width: "170px", height: "170px", objectFit: "contain" }}
                  />
                </div>

                <div className="relative z-10 flex h-full flex-col">
                  <div className="grid grid-cols-[52px_1fr_52px] items-start gap-2 sm:grid-cols-[72px_1fr_72px] sm:gap-3">
                    <div className="flex justify-start pt-1">
                      <Image
                        src="/logo.jpg"
                        alt="Basilan State College logo"
                        width={58}
                        height={58}
                        priority
                        loading="eager"
                        unoptimized
                        style={{ width: "58px", height: "58px", objectFit: "contain" }}
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

                      <h1 className="mt-2 text-[15px] font-bold uppercase leading-none tracking-wide text-slate-900 sm:mt-3 sm:text-[24px]">
                        College Entrance Test Result
                      </h1>

                      <p className="mt-1 text-[8px] text-slate-700 sm:text-[10px]">
                        School Year {schoolYear?.label ?? "Not available"}
                      </p>

                      <div className="mt-3 sm:mt-4">
                        <p className="text-[17px] font-bold uppercase leading-tight underline decoration-[1px] underline-offset-2 text-slate-900 sm:text-[28px]">
                          {fullName}
                        </p>
                        <p className="mt-1 text-[7px] text-slate-700 sm:text-[9px]">
                          Examinee&apos;s Name
                        </p>
                      </div>

                      <div className="mt-4 sm:mt-5">
                        <p className="text-[17px] font-bold uppercase leading-none text-slate-900 sm:text-[30px]">
                          Overall Ability Rating
                        </p>
                        <p className="mt-1.5 text-[34px] font-extrabold leading-none tracking-tight text-red-600 sm:mt-2 sm:text-[50px]">
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
                        style={{ width: "58px", height: "58px", objectFit: "contain" }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 border-t border-blue-200 pt-3 sm:mt-5 sm:pt-4">
                    <div className="grid grid-cols-2 gap-3 sm:gap-6">
                      <div className="space-y-1 text-[7.5px] leading-4 text-slate-800 sm:space-y-1.5 sm:text-[10px] sm:leading-5">
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

                        <p className="pt-1 text-[7px] leading-4 text-slate-700 sm:text-[9px]">
                          Note: This CET result is subject to verification against the
                          official Testing and Evaluation Center masterlist. Any erasure
                          or alteration hereon nullifies this result.
                        </p>
                      </div>

                      <div className="flex items-end justify-end">
                        <div className="max-w-[235px] text-right">
                          <div className="mb-2 h-4 sm:mb-3 sm:h-5" />
                          <p className="text-[9px] font-semibold uppercase leading-tight text-slate-900 sm:text-[12px]">
                            AL-BASSER S. SAPPAYANI, ED. D, RGC
                          </p>
                          <p className="text-[7.5px] text-slate-800 sm:text-[9px]">
                            Director, TEC
                          </p>
                          <p className="text-[7.5px] text-slate-800 sm:text-[9px]">
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

                  <div className="mt-3 border-t border-dashed border-blue-200 pt-2">
                    <div className="flex items-center justify-between text-[6.5px] text-slate-500 sm:text-[8px]">
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
          </div>
        </section>

        {/* Hidden export/print layout: always wide landscape */}
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            left: "-99999px",
            top: "0",
            opacity: 0,
            pointerEvents: "none",
          }}
        >
          <div
            id="result-slip-export"
            data-reference-number={applicant.reference_number}
            data-full-name={fullName}
            data-last-name={applicant.last_name}
            style={{
              width: "1400px",
              height: "760px",
              padding: "12px",
              background: "#ffffff",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                border: "3px solid #1d4ed8",
                padding: "8px",
                background: "#ffffff",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  border: "1.5px solid #93c5fd",
                  padding: "24px 30px 16px",
                  background: "#ffffff",
                  boxSizing: "border-box",
                  overflow: "hidden",
                  fontFamily: "Georgia, Times New Roman, serif",
                  color: "#0f172a",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: 0.05,
                    pointerEvents: "none",
                  }}
                >
                  <Image
                    src="/logo.jpg"
                    alt="Basilan State College watermark"
                    width={300}
                    height={300}
                    unoptimized
                    style={{ width: "300px", height: "300px", objectFit: "contain" }}
                  />
                </div>

                <div
                  style={{
                    position: "relative",
                    zIndex: 1,
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "90px 1fr 90px",
                      gap: "16px",
                      alignItems: "start",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "flex-start" }}>
                      <Image
                        src="/logo.jpg"
                        alt="Basilan State College logo"
                        width={64}
                        height={64}
                        priority
                        loading="eager"
                        unoptimized
                        style={{ width: "64px", height: "64px", objectFit: "contain" }}
                      />
                    </div>

                    <div style={{ textAlign: "center" }}>
                      <p style={{ fontSize: "13px", lineHeight: "17px", margin: 0 }}>
                        Republic of the Philippines
                      </p>
                      <p style={{ fontSize: "13px", lineHeight: "17px", margin: 0 }}>
                        Basilan State College
                      </p>
                      <p
                        style={{
                          fontSize: "16px",
                          lineHeight: "19px",
                          margin: 0,
                          fontWeight: 700,
                          textTransform: "uppercase",
                        }}
                      >
                        Testing and Evaluation Center
                      </p>
                      <p style={{ fontSize: "13px", lineHeight: "17px", margin: 0 }}>
                        Isabela City, Basilan
                      </p>

                      <h1
                        style={{
                          margin: "22px 0 0",
                          fontSize: "46px",
                          lineHeight: 1,
                          fontWeight: 700,
                          textTransform: "uppercase",
                        }}
                      >
                        College Entrance Test Result
                      </h1>

                      <p style={{ margin: "8px 0 0", fontSize: "18px" }}>
                        School Year {schoolYear?.label ?? "Not available"}
                      </p>

                      <div style={{ marginTop: "32px" }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "38px",
                            lineHeight: 1.12,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            textDecoration: "underline",
                            textUnderlineOffset: "5px",
                          }}
                        >
                          {fullName}
                        </p>
                        <p style={{ margin: "6px 0 0", fontSize: "16px" }}>
                          Examinee&apos;s Name
                        </p>
                      </div>

                      <div style={{ marginTop: "34px" }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "40px",
                            lineHeight: 1,
                            fontWeight: 700,
                            textTransform: "uppercase",
                          }}
                        >
                          Overall Ability Rating
                        </p>
                        <p
                          style={{
                            margin: "12px 0 0",
                            fontSize: "72px",
                            lineHeight: 1,
                            fontWeight: 800,
                            color: "#dc2626",
                          }}
                        >
                          {Number(result.overall_percentage).toFixed(2)}%
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <Image
                        src="/testing.png"
                        alt="Testing and Evaluation Center seal"
                        width={64}
                        height={64}
                        priority
                        loading="eager"
                        unoptimized
                        style={{ width: "64px", height: "64px", objectFit: "contain" }}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: "auto",
                      borderTop: "1px solid #bfdbfe",
                      paddingTop: "18px",
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "24px",
                    }}
                  >
                    <div style={{ fontSize: "16px", lineHeight: 1.65 }}>
                      <p style={{ margin: 0 }}>
                        <strong>Valid until:</strong>{" "}
                        {schoolYear?.label ? `${schoolYear.label} only` : "Not available"}
                      </p>
                      <p style={{ margin: 0 }}>
                        <strong>Date of Examination:</strong> {formatDate(schedule?.exam_date)}
                      </p>
                      <p style={{ margin: 0 }}>
                        <strong>Reference Number:</strong> {applicant.reference_number}
                      </p>

                      {result.remarks ? (
                        <p style={{ margin: 0 }}>
                          <strong>Remarks:</strong> {result.remarks}
                        </p>
                      ) : null}

                      <p style={{ margin: "12px 0 0", fontSize: "14px", lineHeight: 1.55 }}>
                        Note: This CET result is subject to verification against the official
                        Testing and Evaluation Center masterlist. Any erasure or alteration
                        hereon nullifies this result.
                      </p>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "end" }}>
                      <div style={{ maxWidth: "320px", textAlign: "right" }}>
                        <div style={{ height: "24px" }} />
                        <p
                          style={{
                            margin: 0,
                            fontSize: "22px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            lineHeight: 1.2,
                          }}
                        >
                          AL-BASSER S. SAPPAYANI, ED. D, RGC
                        </p>
                        <p style={{ margin: 0, fontSize: "15px" }}>Director, TEC</p>
                        <p style={{ margin: 0, fontSize: "15px" }}>
                          R.A. 9258, PRC License # 0000876
                        </p>

                        {result.published_at ? (
                          <p style={{ margin: "8px 0 0", fontSize: "13px", color: "#475569" }}>
                            Published: {formatDate(result.published_at)}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: "14px",
                      borderTop: "1px dashed #bfdbfe",
                      paddingTop: "8px",
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "12px",
                      color: "#64748b",
                    }}
                  >
                    <p style={{ margin: 0 }}>
                      Generated by <strong style={{ color: "#334155" }}>BASC-CET-Result-System</strong>
                    </p>
                    <p style={{ margin: 0 }}>
                      Generated on <strong style={{ color: "#334155" }}>{formatDateTime(generatedAt)}</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}