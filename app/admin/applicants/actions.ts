"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import * as XLSX from "xlsx"

function clean(value: FormDataEntryValue | null) {
  return String(value || "").trim()
}

async function generateReferenceNumber() {
  const supabase = await createClient()
  const year = new Date().getFullYear()

  const { data, error } = await supabase
    .from("applicants")
    .select("reference_number")
    .ilike("reference_number", `BASC-${year}-%`)
    .order("reference_number", { ascending: false })
    .limit(1)

  if (error) {
    throw new Error(error.message)
  }

  const latest = data?.[0]?.reference_number
  const latestNumber = latest ? Number(latest.split("-").pop()) || 0 : 0
  const nextNumber = String(latestNumber + 1).padStart(6, "0")

  return `BASC-${year}-${nextNumber}`
}

export async function createApplicant(formData: FormData) {
  const supabase = await createClient()

  let referenceNumber = clean(formData.get("reference_number"))
  const firstName = clean(formData.get("first_name"))
  const middleName = clean(formData.get("middle_name"))
  const lastName = clean(formData.get("last_name"))
  const email = clean(formData.get("email"))

  if (!firstName) throw new Error("First name is required.")
  if (!lastName) throw new Error("Last name is required.")

  if (!referenceNumber) {
    referenceNumber = await generateReferenceNumber()
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

export async function updateApplicant(formData: FormData) {
  const supabase = await createClient()

  const id = clean(formData.get("id"))
  const referenceNumber = clean(formData.get("reference_number"))
  const firstName = clean(formData.get("first_name"))
  const middleName = clean(formData.get("middle_name"))
  const lastName = clean(formData.get("last_name"))
  const email = clean(formData.get("email"))

  if (!id) throw new Error("Applicant ID is required.")
  if (!referenceNumber) throw new Error("Reference number is required.")
  if (!firstName) throw new Error("First name is required.")
  if (!lastName) throw new Error("Last name is required.")

  const { error } = await supabase
    .from("applicants")
    .update({
      reference_number: referenceNumber,
      first_name: firstName,
      middle_name: middleName || null,
      last_name: lastName,
      email: email || null,
    })
    .eq("id", id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/admin/applicants")
  revalidatePath("/admin/dashboard")
}

export async function deleteApplicant(formData: FormData) {
  const supabase = await createClient()

  const id = clean(formData.get("id"))
  if (!id) throw new Error("Applicant ID is required.")

  const { error } = await supabase.from("applicants").delete().eq("id", id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/admin/applicants")
  revalidatePath("/admin/dashboard")
}

export async function bulkImportApplicants(formData: FormData) {
  const supabase = await createClient()
  const file = formData.get("file") as File | null

  if (!file) {
    throw new Error("Excel file is required.")
  }

  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: "array" })
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet)

  if (!rows.length) {
    throw new Error("The uploaded file is empty.")
  }

  const payload: Array<{
    reference_number: string
    first_name: string
    middle_name: string | null
    last_name: string
    email: string | null
  }> = []

  let generatedCounter = 0
  let latestGeneratedBase = 0
  const currentYear = new Date().getFullYear()

  const { data: latestRefs, error: latestRefsError } = await supabase
    .from("applicants")
    .select("reference_number")
    .ilike("reference_number", `BASC-${currentYear}-%`)
    .order("reference_number", { ascending: false })
    .limit(1)

  if (latestRefsError) {
    throw new Error(latestRefsError.message)
  }

  const latestReference = latestRefs?.[0]?.reference_number
  latestGeneratedBase = latestReference
    ? Number(latestReference.split("-").pop()) || 0
    : 0

  for (const row of rows) {
    const firstName = String(row.first_name ?? row["First Name"] ?? "").trim()
    const middleName = String(row.middle_name ?? row["Middle Name"] ?? "").trim()
    const lastName = String(row.last_name ?? row["Last Name"] ?? "").trim()
    const email = String(row.email ?? row["Email"] ?? "").trim()
    let referenceNumber = String(
      row.reference_number ?? row["Reference Number"] ?? ""
    ).trim()

    if (!firstName || !lastName) continue

    if (!referenceNumber) {
      generatedCounter += 1
      referenceNumber = `BASC-${currentYear}-${String(
        latestGeneratedBase + generatedCounter
      ).padStart(6, "0")}`
    }

    payload.push({
      reference_number: referenceNumber,
      first_name: firstName,
      middle_name: middleName || null,
      last_name: lastName,
      email: email || null,
    })
  }

  if (!payload.length) {
    throw new Error("No valid applicant rows were found.")
  }

  const { error } = await supabase.from("applicants").insert(payload)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/admin/applicants")
  revalidatePath("/admin/dashboard")
}

export async function getApplicantsForExport() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("applicants")
    .select("reference_number, first_name, middle_name, last_name, email, created_at")
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}