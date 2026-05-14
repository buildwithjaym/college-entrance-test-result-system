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
    <main className="relative min-h-dvh overflow-hidden bg-background px-3 py-4 sm:px-6 sm:py-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(185,28,28,0.16),transparent_35%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom_left,rgba(185,28,28,0.06),transparent,rgba(185,28,28,0.1))]" />

      <div className="relative mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-5xl items-center justify-center">
        {children}
      </div>
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
      <div className="w-full overflow-hidden rounded-[2rem] border border-red-200 bg-background/95 shadow-2xl backdrop-blur">
        <div className="bg-gradient-to-br from-red-700 via-red-600 to-red-900 px-5 py-9 text-center text-white sm:px-10 sm:py-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25 sm:h-24 sm:w-24">
            <XCircle className="h-11 w-11 sm:h-12 sm:w-12" />
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.28em] text-red-100">
            Result Verification
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            {title}
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-red-50 sm:text-base">
            {description}
          </p>
        </div>

        <div className="p-5 sm:p-8">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm leading-7 text-red-900">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-1 h-5 w-5 shrink-0" />
              <div>
                <p className="font-black">Possible reasons</p>
                <p className="mt-1">
                  The QR code may be incorrect, edited, revoked, expired, or the
                  result does not exist in the official records.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-7 text-center">
            <Link
              href="/student-login"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-7 text-sm font-bold text-primary-foreground shadow-lg transition hover:bg-primary/90"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to login
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
  const isQualifier = qualificationStatus === "QUALIFIER"

  return (
    <VerificationShell>
      <div className="w-full overflow-hidden rounded-[2rem] border border-primary/15 bg-background/95 shadow-2xl backdrop-blur">
        <div className="relative overflow-hidden bg-gradient-to-br from-red-700 via-primary to-red-900 px-5 py-9 text-center text-white sm:px-10 sm:py-12">
          <div className="absolute left-8 top-8 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute bottom-8 right-8 h-32 w-32 rounded-full bg-white/10 blur-3xl" />

          <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25 sm:h-24 sm:w-24">
            <BadgeCheck className="h-11 w-11 sm:h-12 sm:w-12" />
          </div>

          <p className="relative mt-6 text-xs font-bold uppercase tracking-[0.28em] text-red-100">
            Official Result Verification
          </p>

          <h1 className="relative mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            Verified Authentic Result
          </h1>

          <p className="relative mx-auto mt-4 max-w-2xl text-sm leading-7 text-red-50 sm:text-base">
            This CET result is officially recorded in the BASC Testing and
            Evaluation Center database.
          </p>
        </div>

        <div className="p-5 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoCard
              icon={<UserRound className="h-5 w-5 text-primary" />}
              label="Applicant Name"
              value={fullName}
            />

            <InfoCard
              icon={<Hash className="h-5 w-5 text-primary" />}
              label="Reference Number"
              value={applicant.reference_number}
              valueClassName="text-primary"
            />

            <InfoCard
              icon={<FileCheck2 className="h-5 w-5 text-primary" />}
              label="Overall Ability Rating"
              value={`${overallScore.toFixed(2)}%`}
            />

            <InfoCard
              icon={<ShieldCheck className="h-5 w-5 text-primary" />}
              label="Qualification Status"
              value={qualificationStatus}
              valueClassName={isQualifier ? "text-green-700" : "text-red-700"}
            />
          </div>

          <div className="mt-5 rounded-3xl border border-primary/10 bg-primary/5 p-5">
            <div className="grid gap-4 text-sm sm:grid-cols-2">
              <DetailItem label="School Year" value={schoolYear?.label ?? "Not available"} />
              <DetailItem label="Exam Date" value={formatDate(schedule?.exam_date)} />
              <DetailItem label="Published" value={formatDate(result.published_at)} />
              <DetailItem label="Verification Code" value={verification.verification_code} />
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-green-200 bg-green-50 p-5 text-center text-sm font-semibold text-green-800">
            <CalendarDays className="mx-auto mb-2 h-5 w-5" />
            Verified from the official BASC CET database.
          </div>

          <div className="mt-7 text-center">
            <Link
              href="/student-login"
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-primary px-7 text-sm font-bold text-primary-foreground shadow-lg transition hover:bg-primary/90"
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
  valueClassName = "text-foreground",
}: {
  icon: React.ReactNode
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div className="rounded-3xl border border-primary/10 bg-background p-5 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
        {icon}
      </div>

      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <p className={`mt-1 break-words text-lg font-black uppercase ${valueClassName}`}>
        {value}
      </p>
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <p className="leading-6">
      <span className="block text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="font-bold text-foreground">{value}</span>
    </p>
  )
}