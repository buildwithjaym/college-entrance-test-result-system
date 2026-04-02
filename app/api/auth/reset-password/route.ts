import { NextResponse } from "next/server"
import crypto from "crypto"
import { createAdminClient } from "@/lib/supabase/admin"

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function hashOtp(otp: string) {
  return crypto.createHash("sha256").update(otp).digest("hex")
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const email = normalizeEmail(String(body?.email || ""))
    const otp = String(body?.otp || "").trim()
    const newPassword = String(body?.newPassword || "").trim()

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { message: "Email, OTP, and new password are required." },
        { status: 400 }
      )
    }

    if (otp.length !== 6) {
      return NextResponse.json(
        { message: "Please enter a valid 6-digit OTP." },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { message: "Your new password must be at least 8 characters long." },
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
          message: "Unable to reset your password right now. Please try again.",
        },
        { status: 500 }
      )
    }

    if (!profile) {
      return NextResponse.json(
        {
          message: "The OTP is invalid or has expired. Please request a new one.",
        },
        { status: 400 }
      )
    }

    const otpHash = hashOtp(otp)
    const nowIso = new Date().toISOString()

    const { data: otpRecord, error: otpError } = await supabase
      .from("password_reset_otps")
      .select("id, user_id, otp_hash, expires_at, used_at")
      .eq("user_id", profile.id)
      .eq("email", email)
      .is("used_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (otpError) {
      return NextResponse.json(
        {
          message: "Unable to reset your password right now. Please try again.",
        },
        { status: 500 }
      )
    }

    if (!otpRecord) {
      return NextResponse.json(
        {
          message: "The OTP is invalid or has expired. Please request a new one.",
        },
        { status: 400 }
      )
    }

    if (otpRecord.used_at) {
      return NextResponse.json(
        {
          message: "This OTP has already been used. Please request a new one.",
        },
        { status: 400 }
      )
    }

    if (otpRecord.expires_at < nowIso) {
      return NextResponse.json(
        {
          message: "The OTP is invalid or has expired. Please request a new one.",
        },
        { status: 400 }
      )
    }

    if (otpRecord.otp_hash !== otpHash) {
      return NextResponse.json(
        {
          message: "The OTP is invalid or has expired. Please request a new one.",
        },
        { status: 400 }
      )
    }

    const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
      profile.id,
      {
        password: newPassword,
      }
    )

    if (authUpdateError) {
      return NextResponse.json(
        {
          message: "Unable to reset your password right now. Please try again.",
        },
        { status: 500 }
      )
    }

    const { error: profileUpdateError } = await supabase
      .from("profiles")
      .update({ must_change_password: false })
      .eq("id", profile.id)

    if (profileUpdateError) {
      return NextResponse.json(
        {
          message: "Your password was updated, but setup could not be completed.",
        },
        { status: 500 }
      )
    }

    const { error: otpUseError } = await supabase
      .from("password_reset_otps")
      .update({ used_at: nowIso })
      .eq("id", otpRecord.id)

    if (otpUseError) {
      return NextResponse.json(
        {
          message: "Your password was updated, but OTP finalization failed.",
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: "Password reset successful.",
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