"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function createApplicant(formData: FormData) {
  const supabase = await createClient()

  const referenceNumber = String(formData.get("reference_number") || "").trim()
  const firstName = String(formData.get("first_name") || "").trim()
  const middleName = String(formData.get("middle_name") || "").trim()
  const lastName = String(formData.get("last_name") || "").trim()
  const email = String(formData.get("email") || "").trim()

  if (!referenceNumber) {
    throw new Error("Reference number is required.")
  }

  if (!firstName) {
    throw new Error("First name is required.")
  }

  if (!lastName) {
    throw new Error("Last name is required.")
  }

  const { error } = await supabase.from("applicants").insert({
    reference_number: referenceNumber,
    first_name: firstName,
    middle_name: middleName || null,
    last_name: lastName,
    email: email || null,
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/admin/applicants")
  revalidatePath("/admin/dashboard")
}