import crypto from "crypto"
import { createClient } from "@supabase/supabase-js"

function getRequiredEnv(name: string) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }

  return value
}

const siteUrl = getRequiredEnv("NEXT_PUBLIC_SITE_URL")
const secret = getRequiredEnv("RESULT_VERIFICATION_SECRET")
const supabaseUrl = getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL")
const serviceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY")

export const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

export function createVerificationUrl(token: string) {
  return `${siteUrl.replace(/\/$/, "")}/verify/${token}`
}

export function createVerificationHash({
  resultId,
  applicantId,
  overallPercentage,
  publishedAt,
}: {
  resultId: number | string
  applicantId: number | string
  overallPercentage: number | string
  publishedAt: string | null
}) {
  const payload = [
    resultId,
    applicantId,
    Number(overallPercentage).toFixed(2),
    publishedAt ?? "",
  ].join(":")

  return crypto.createHmac("sha256", secret).update(payload).digest("hex")
}

export function createVerificationCode() {
  const partOne = crypto.randomBytes(2).toString("hex").toUpperCase()
  const partTwo = crypto.randomBytes(2).toString("hex").toUpperCase()
  const partThree = crypto.randomBytes(2).toString("hex").toUpperCase()

  return `BASC-${partOne}-${partTwo}-${partThree}`
}

export function createVerificationToken() {
  return crypto.randomUUID()
}

export async function ensureResultVerification({
  resultId,
  applicantId,
  overallPercentage,
  publishedAt,
}: {
  resultId: number
  applicantId: number
  overallPercentage: number | string
  publishedAt: string | null
}) {
  const { data: existing, error: existingError } = await adminSupabase
    .from("result_verifications")
    .select("*")
    .eq("result_id", resultId)
    .maybeSingle()

  if (existingError) {
    throw new Error(existingError.message)
  }

  if (existing) {
    return existing
  }

  const verificationToken = createVerificationToken()
  const verificationCode = createVerificationCode()
  const verificationHash = createVerificationHash({
    resultId,
    applicantId,
    overallPercentage,
    publishedAt,
  })

  const { data, error } = await adminSupabase
    .from("result_verifications")
    .insert({
      result_id: resultId,
      verification_token: verificationToken,
      verification_code: verificationCode,
      verification_hash: verificationHash,
      is_active: true,
    })
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function logVerificationAttempt({
  verificationId,
  tokenUsed,
  status,
  ipAddress,
  userAgent,
}: {
  verificationId?: number | null
  tokenUsed: string
  status: "verified" | "invalid" | "revoked" | "hash_mismatch"
  ipAddress?: string | null
  userAgent?: string | null
}) {
  await adminSupabase.from("result_verification_logs").insert({
    verification_id: verificationId ?? null,
    token_used: tokenUsed,
    status,
    ip_address: ipAddress ?? null,
    user_agent: userAgent ?? null,
  })
}