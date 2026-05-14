import { NextResponse } from "next/server"

import {
  adminSupabase,
  createVerificationHash,
} from "@/lib/result-verification"

function getSingleRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null
  return Array.isArray(value) ? (value[0] ?? null) : value
}

function cleanValue(value: unknown) {
  if (typeof value !== "string") return ""
  return value.trim()
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  const token = cleanValue(body?.token)
  const code = cleanValue(body?.code)
  const lookupValue = token || code

  if (!lookupValue) {
    return NextResponse.json(
      {
        valid: false,
        status: "missing",
        message: "Missing verification token or code.",
      },
      { status: 400 }
    )
  }

  const { data: verification, error } = await adminSupabase
    .from("result_verifications")
    .select(`
      id,
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
        applicants (
          reference_number,
          first_name,
          middle_name,
          last_name
        ),
        school_years (
          label
        ),
        test_schedules (
          exam_date
        )
      )
    `)
    .or(`verification_token.eq.${lookupValue},verification_code.eq.${lookupValue}`)
    .maybeSingle()

  if (error || !verification) {
    return NextResponse.json({
      valid: false,
      status: "invalid",
      message: "Invalid QR code. This result was not found.",
    })
  }

  if (!verification.is_active || verification.revoked_at) {
    return NextResponse.json({
      valid: false,
      status: "revoked",
      message:
        verification.revoked_reason ||
        "This result verification has been revoked.",
    })
  }

  const result = getSingleRelation(verification.results)
  const applicant = getSingleRelation(result?.applicants)
  const schoolYear = getSingleRelation(result?.school_years)
  const schedule = getSingleRelation(result?.test_schedules)

  if (!result || !result.is_published || !applicant) {
    return NextResponse.json({
      valid: false,
      status: "invalid",
      message: "This result is not published or does not exist.",
    })
  }

  const expectedHash = createVerificationHash({
    resultId: result.id,
    applicantId: result.applicant_id,
    overallPercentage: result.overall_percentage,
    publishedAt: result.published_at,
  })

  if (expectedHash !== verification.verification_hash) {
    return NextResponse.json({
      valid: false,
      status: "tampered",
      message: "Tampered result detected. Security hash does not match.",
    })
  }

  const fullName = [
    applicant.last_name,
    applicant.first_name,
    applicant.middle_name,
  ]
    .filter(Boolean)
    .join(", ")

  const score = Number(result.overall_percentage)

  return NextResponse.json({
    valid: true,
    status: "verified",
    message: "Legit student result. QR code is authentic.",
    data: {
      fullName,
      referenceNumber: applicant.reference_number,
      overallPercentage: `${score.toFixed(2)}%`,
      qualificationStatus: score >= 35 ? "QUALIFIER" : "NON-QUALIFIER",
      schoolYear: schoolYear?.label ?? "Not available",
      examDate: schedule?.exam_date ?? null,
      publishedAt: result.published_at,
      verificationCode: verification.verification_code,
      verificationToken: verification.verification_token,
    },
  })
}