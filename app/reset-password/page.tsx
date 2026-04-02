import { redirect } from "next/navigation"
import ResetPasswordForm from "./reset-password-form"

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const params = await searchParams
  const email = (params.email || "").trim().toLowerCase()

  if (!isValidEmail(email)) {
    redirect("/forgot-password")
  }

  return <ResetPasswordForm email={email} />
}