import Link from "next/link"
import { headers } from "next/headers"
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  FileCheck2,
  Hash,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react"

import {
  adminSupabase,
  createVerificationHash,
  logVerificationAttempt,
} from "@/lib/result-verification"

function formatDate(date?: string | null) {
  if (!date) return "Not available"

  return new Date(date).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function getSingleRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null
  return Array.isArray(value) ? (value[0] ?? null) : value
}

function VerificationShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh bg-slate-100 px-3 py-4 sm:px-4 sm:py-6">
      <div className="mx-auto max-w-4xl">{children}</div>
    </main>
  )
}

function InvalidResult({
  title = "Invalid or Tampered Result",
  description = "The verification code or QR token could not be validated in the official BASC CET database.",
}: {
  title?: string
  description?: string
}) {
  return (
    <VerificationShell>
      <div className="overflow-hidden rounded-[2rem] border border-red-100 bg-white shadow-sm">
        <div className="bg-gradient-to-br from-red-600 via-red-600 to-red-800 px-5 py-8 text-center text-white sm:px-8 sm:py-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
            <XCircle className="h-10 w-10" />
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.28em] text-red-100">
            Result Verification
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            {title}
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-red-50">
            {description}
          </p>
        </div>

        <div className="p-5 sm:p-6">
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm leading-7 text-red-900">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-1 h-5 w-5 shrink-0" />
              <div>
                <p className="font-bold">Possible reasons:</p>
                <p>
                  The QR code may be incorrect, edited, revoked, or the result
                  does not exist in the official records.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/student-login"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 text-sm font-bold text-white transition hover:bg-red-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Go back
            </Link>
          </div>
        </div>
      </div>
    </VerificationShell>
  )
}

export default async function VerifyResultPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const requestHeaders = await headers()

  const ipAddress =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null

  const userAgent = requestHeaders.get("user-agent")

  const { data: verification, error } = await adminSupabase
    .from("result_verifications")
    .select(`
      id,
      result_id,
      verification_token,
      verification_code,
      verification_hash,
      is_active,
      revoked_at,
      revoked_reason,
      results (
        id,
        applicant_id,
        overall_percentage,
        remarks,
        is_published,
        published_at,
        created_at,
        applicants (
          id,
          reference_number,
          first_name,
          middle_name,
          last_name
        ),
        school_years (
          id,
          label
        ),
        test_schedules (
          id,
          name,
          exam_date
        )
      )
    `)
    .eq("verification_token", token)
    .maybeSingle()

  if (error || !verification) {
    await logVerificationAttempt({
      tokenUsed: token,
      status: "invalid",
      ipAddress,
      userAgent,
    })

    return <InvalidResult />
  }

  if (!verification.is_active || verification.revoked_at) {
    await logVerificationAttempt({
      verificationId: verification.id,
      tokenUsed: token,
      status: "revoked",
      ipAddress,
      userAgent,
    })

    return (
      <InvalidResult
        title="Revoked Result Verification"
        description={
          verification.revoked_reason ||
          "This result verification has been revoked by the Testing and Evaluation Center."
        }
      />
    )
  }

  const result = getSingleRelation(verification.results)

  if (!result || !result.is_published) {
    await logVerificationAttempt({
      verificationId: verification.id,
      tokenUsed: token,
      status: "invalid",
      ipAddress,
      userAgent,
    })

    return <InvalidResult />
  }

  const applicant = getSingleRelation(result.applicants)
  const schoolYear = getSingleRelation(result.school_years)
  const schedule = getSingleRelation(result.test_schedules)

  if (!applicant) {
    await logVerificationAttempt({
      verificationId: verification.id,
      tokenUsed: token,
      status: "invalid",
      ipAddress,
      userAgent,
    })

    return <InvalidResult />
  }

  const expectedHash = createVerificationHash({
    resultId: result.id,
    applicantId: result.applicant_id,
    overallPercentage: result.overall_percentage,
    publishedAt: result.published_at,
  })

  if (expectedHash !== verification.verification_hash) {
    await logVerificationAttempt({
      verificationId: verification.id,
      tokenUsed: token,
      status: "hash_mismatch",
      ipAddress,
      userAgent,
    })

    return (
      <InvalidResult
        title="Tampered Result Detected"
        description="The verification record exists, but its security hash no longer matches the official result data."
      />
    )
  }

  await logVerificationAttempt({
    verificationId: verification.id,
    tokenUsed: token,
    status: "verified",
    ipAddress,
    userAgent,
  })

  const fullName = [
    applicant.last_name,
    applicant.first_name,
    applicant.middle_name,
  ]
    .filter(Boolean)
    .join(", ")

  const overallScore = Number(result.overall_percentage)
  const qualificationStatus = overallScore >= 35 ? "QUALIFIER" : "NON-QUALIFIER"

  return (
    <VerificationShell>
      <div className="overflow-hidden rounded-[2rem] border border-green-100 bg-white shadow-sm">
        <div className="bg-gradient-to-br from-green-600 via-green-600 to-emerald-800 px-5 py-8 text-center text-white sm:px-8 sm:py-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
            <BadgeCheck className="h-11 w-11" />
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.28em] text-green-100">
            Result Verification
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            Verified Authentic Result
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-green-50">
            This CET result is officially recorded in the BASC Testing and
            Evaluation Center database.
          </p>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoCard
              icon={<UserRound className="h-5 w-5 text-green-700" />}
              label="Applicant Name"
              value={fullName}
            />

            <InfoCard
              icon={<Hash className="h-5 w-5 text-green-700" />}
              label="Reference Number"
              value={applicant.reference_number}
              valueClassName="text-red-700"
            />

            <InfoCard
              icon={<FileCheck2 className="h-5 w-5 text-green-700" />}
              label="Overall Ability Rating"
              value={`${overallScore.toFixed(2)}%`}
            />

            <InfoCard
              icon={<ShieldCheck className="h-5 w-5 text-green-700" />}
              label="Qualification Status"
              value={qualificationStatus}
              valueClassName={
                qualificationStatus === "QUALIFIER"
                  ? "text-green-700"
                  : "text-red-700"
              }
            />
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <p>
                <span className="font-bold text-slate-900">School Year:</span>{" "}
                {schoolYear?.label ?? "Not available"}
              </p>

              <p>
                <span className="font-bold text-slate-900">Exam Date:</span>{" "}
                {formatDate(schedule?.exam_date)}
              </p>

              <p>
                <span className="font-bold text-slate-900">Published:</span>{" "}
                {formatDate(result.published_at)}
              </p>

              <p>
                <span className="font-bold text-slate-900">
                  Verification Code:
                </span>{" "}
                {verification.verification_code}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-green-100 bg-green-50 p-4 text-center text-sm font-semibold text-green-800">
            <CalendarDays className="mx-auto mb-2 h-5 w-5" />
            Verified from the official BASC CET database.
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/student-login"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-red-600 px-6 text-sm font-bold text-white transition hover:bg-red-700"
            >
              Return to login
            </Link>
          </div>
        </div>
      </div>
    </VerificationShell>
  )
}

function InfoCard({
  icon,
  label,
  value,
  valueClassName = "text-slate-950",
}: {
  icon: React.ReactNode
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      {icon}
      <p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className={`mt-1 text-lg font-black uppercase ${valueClassName}`}>
        {value}
      </p>
    </div>
  )
}