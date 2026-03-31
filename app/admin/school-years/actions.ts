"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function createSchoolYear(formData: FormData) {
  const supabase = await createClient()

  const label = String(formData.get("label") || "").trim()

  if (!label) {
    throw new Error("School year label is required.")
  }

  const { error } = await supabase.from("school_years").insert({
    label,
    is_active: false,
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/admin/school-years")
}

export async function setActiveSchoolYear(formData: FormData) {
  const supabase = await createClient()

  const id = Number(formData.get("id"))

  if (!id) {
    throw new Error("Invalid school year.")
  }

  const { error: resetError } = await supabase
    .from("school_years")
    .update({ is_active: false })
    .neq("id", 0)

  if (resetError) {
    throw new Error(resetError.message)
  }

  const { error } = await supabase
    .from("school_years")
    .update({ is_active: true })
    .eq("id", id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/admin/school-years")
}