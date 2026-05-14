"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

const MAX_ATTEMPTS = 5
const LOCK_TIME = 30 * 1000

type LoginAttempt = {
  count: number
  lockedUntil: number | null
}

const attempts = new Map<string, LoginAttempt>()

function getAttemptKey(email: string, ip: string | null) {
  return `${email.toLowerCase()}-${ip ?? "unknown"}`
}

export async function adminLoginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const password = String(formData.get("password") ?? "")

  if (!email || !password) {
    return {
      success: false,
      message: "Please enter your email and password.",
    }
  }

  const requestHeaders = await headers()
  const ip =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    requestHeaders.get("x-real-ip") ??
    null

  const key = getAttemptKey(email, ip)
  const now = Date.now()
  const current = attempts.get(key)

  if (current?.lockedUntil && current.lockedUntil > now) {
    const secondsLeft = Math.ceil((current.lockedUntil - now) / 1000)

    return {
      success: false,
      message: `Too many failed attempts. Please wait ${secondsLeft} seconds before trying again.`,
    }
  }

  const supabase = await createClient()

  const { data: signInData, error: signInError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    })

  if (signInError || !signInData.user) {
    const nextCount = (current?.count ?? 0) + 1

    attempts.set(key, {
      count: nextCount,
      lockedUntil: nextCount >= MAX_ATTEMPTS ? now + LOCK_TIME : null,
    })

    return {
      success: false,
      message:
        nextCount >= MAX_ATTEMPTS
          ? "Too many failed attempts. Please wait 30 seconds before trying again."
          : `Invalid email or password. Attempt ${nextCount} of ${MAX_ATTEMPTS}.`,
    }
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", signInData.user.id)
    .single()

  if (profileError || !profile || profile.role !== "admin") {
    await supabase.auth.signOut()

    return {
      success: false,
      message: "This account is not authorized for admin access.",
    }
  }

  attempts.delete(key)

  redirect("/admin/dashboard")
}