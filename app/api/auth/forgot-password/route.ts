import { NextResponse } from "next/server"
import crypto from "crypto"
import { Resend } from "resend"
import { createAdminClient } from "@/lib/supabase/admin"

const resend = new Resend(process.env.RESEND_API_KEY)

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function hashOtp(otp: string) {
  return crypto.createHash("sha256").update(otp).digest("hex")
}

function buildOtpEmailTemplate({
  otp,
  expiresInMinutes = 10,
}: {
  otp: string
  expiresInMinutes?: number
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ""
  const logoUrl = appUrl ? `${appUrl}/testing.png` : ""

  const brandRed = "#b91c1c"
  const brandRedDark = "#991b1b"
  const brandRedSoft = "#fef2f2"
  const pageBg = "#f8fafc"
  const cardBorder = "#e2e8f0"
  const textMain = "#0f172a"
  const textMuted = "#475569"
  const otpBorder = "#fecaca"
  const warningBg = "#fff7ed"
  const warningBorder = "#fed7aa"
  const warningText = "#9a3412"

  const logoBlock = logoUrl
    ? `
      <img
        src="${logoUrl}"
        alt="Testing Center"
        width="56"
        height="56"
        style="display:block;width:56px;height:56px;border-radius:16px;background:rgba(255,255,255,0.16);padding:8px;object-fit:contain;"
      />
    `
    : `
      <div style="width:56px;height:56px;border-radius:16px;background:rgba(255,255,255,0.16);display:flex;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,0.18);">
        <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:1px;">TC</span>
      </div>
    `

  return `
    <div style="margin:0;padding:0;background:${pageBg};">
      <div style="max-width:640px;margin:0 auto;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:${textMain};">
        <div style="overflow:hidden;border:1px solid ${cardBorder};border-radius:24px;background:#ffffff;box-shadow:0 10px 30px rgba(15,23,42,0.08);">

          <div style="background:linear-gradient(135deg, ${brandRedDark} 0%, ${brandRed} 100%);padding:28px 32px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td style="width:72px;vertical-align:middle;">
                  ${logoBlock}
                </td>
                <td style="vertical-align:middle;padding-left:14px;">
                  <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.85);font-weight:700;">
                    CET Result System
                  </div>
                  <div style="margin-top:6px;font-size:24px;line-height:1.25;font-weight:700;color:#ffffff;">
                    Password Reset Request
                  </div>
                </td>
              </tr>
            </table>
          </div>

          <div style="padding:32px;">
            <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:${textMuted};">
              We received a request to reset your password for your CET Result account.
            </p>

            <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:${textMuted};">
              Use the one-time password below to continue resetting your account password.
            </p>

            <div style="margin:24px 0;padding:24px;border:1px solid ${otpBorder};border-radius:20px;background:${brandRedSoft};text-align:center;">
              <div style="margin-bottom:10px;font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${brandRed};">
                Your One-Time Password
              </div>
              <div style="font-size:38px;line-height:1;font-weight:800;letter-spacing:8px;color:${brandRedDark};">
                ${otp}
              </div>
            </div>

            <div style="margin:0 0 18px;padding:16px 18px;border-radius:16px;background:${warningBg};border:1px solid ${warningBorder};">
              <p style="margin:0;font-size:14px;line-height:1.7;color:${warningText};">
                This OTP will expire in <strong>${expiresInMinutes} minutes</strong>.
              </p>
            </div>

            <p style="margin:0 0 12px;font-size:14px;line-height:1.7;color:${textMuted};">
              If you did not request this password reset, you may safely ignore this email.
            </p>

            <p style="margin:0;font-size:14px;line-height:1.7;color:${textMuted};">
              For your security, never share this code with anyone.
            </p>
          </div>

          <div style="padding:20px 32px;border-top:1px solid ${cardBorder};background:#f8fafc;">
            <p style="margin:0;font-size:12px;line-height:1.6;color:#64748b;">
              CET Result System · Secure student access
            </p>
          </div>
        </div>
      </div>
    </div>
  `
}

export async function GET() {
  return NextResponse.json({ ok: true })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = normalizeEmail(String(body?.email || ""))

    if (!email) {
      return NextResponse.json(
        { message: "Email is required." },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, role")
      .eq("email", email)
      .eq("role", "applicant")
      .maybeSingle()

    if (profileError) {
      return NextResponse.json(
        {
          message:
            "Unable to process your request right now. Please try again.",
        },
        { status: 500 }
      )
    }

    if (!profile) {
      return NextResponse.json({
        message:
          "If the email is registered, a one-time password has been sent.",
      })
    }

    await supabase
      .from("password_reset_otps")
      .delete()
      .eq("user_id", profile.id)
      .is("used_at", null)

    const otp = generateOtp()
    const otpHash = hashOtp(otp)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    const { error: insertError } = await supabase
      .from("password_reset_otps")
      .insert({
        user_id: profile.id,
        email: profile.email,
        otp_hash: otpHash,
        expires_at: expiresAt,
      })

    if (insertError) {
      return NextResponse.json(
        {
          message:
            "Unable to process your request right now. Please try again.",
        },
        { status: 500 }
      )
    }

    const from = process.env.RESEND_FROM_EMAIL

    if (!from) {
      return NextResponse.json(
        {
          message:
            "Email sending is not configured correctly. Please contact the administrator.",
        },
        { status: 500 }
      )
    }

    const { error: emailError } = await resend.emails.send({
      from,
      to: [profile.email],
      subject: "CET Result System - Password Reset OTP",
      html: buildOtpEmailTemplate({
        otp,
        expiresInMinutes: 10,
      }),
    })

    if (emailError) {
      return NextResponse.json(
        {
          message:
            "Unable to send the OTP right now. Please try again later.",
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message:
        "If the email is registered, a one-time password has been sent.",
    })
  } catch {
    return NextResponse.json(
      {
        message: "Something went wrong. Please try again.",
      },
      { status: 500 }
    )
  }
}