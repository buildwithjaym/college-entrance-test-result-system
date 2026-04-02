"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import * as XLSX from "xlsx"

function clean(value: FormDataEntryValue | null) {
  return String(value || "").trim()
}

async function getLatestReferenceBase() {
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
  return latest ? Number(latest.split("-").pop()) || 0 : 0
}

async function generateReferenceNumber() {
  const year = new Date().getFullYear()
  const latestBase = await getLatestReferenceBase()
  const nextNumber = String(latestBase + 1).padStart(6, "0")
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

  const rowsRaw = clean(formData.get("rows_json"))
  if (!rowsRaw) {
    throw new Error("No preview rows were submitted.")
  }

  let rows: Array<{
    reference_number?: string
    first_name: string
    middle_name?: string
    last_name: string
    email?: string
  }> = []

  try {
    rows = JSON.parse(rowsRaw)
  } catch {
    throw new Error("Invalid import payload.")
  }

  if (!rows.length) {
    throw new Error("No valid applicant rows were found.")
  }

  const year = new Date().getFullYear()
  const latestGeneratedBase = await getLatestReferenceBase()
  let generatedCounter = 0

  const payload = rows.map((row) => {
    let referenceNumber = String(row.reference_number || "").trim()

    if (!referenceNumber) {
      generatedCounter += 1
      referenceNumber = `BASC-${year}-${String(
        latestGeneratedBase + generatedCounter
      ).padStart(6, "0")}`
    }

    return {
      reference_number: referenceNumber,
      first_name: String(row.first_name || "").trim(),
      middle_name: String(row.middle_name || "").trim() || null,
      last_name: String(row.last_name || "").trim(),
      email: String(row.email || "").trim() || null,
    }
  })

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

export async function parseApplicantsExcel(formData: FormData) {
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

  const parsedRows = rows
    .map((row, index) => {
      const firstName = String(row.first_name ?? row["First Name"] ?? "").trim()
      const middleName = String(row.middle_name ?? row["Middle Name"] ?? "").trim()
      const lastName = String(row.last_name ?? row["Last Name"] ?? "").trim()
      const email = String(row.email ?? row["Email"] ?? "").trim()
      const referenceNumber = String(
        row.reference_number ?? row["Reference Number"] ?? ""
      ).trim()

      const errors: string[] = []

      if (!firstName) errors.push("Missing first name")
      if (!lastName) errors.push("Missing last name")

      return {
        row_number: index + 2,
        reference_number: referenceNumber,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        email,
        valid: errors.length === 0,
        errors,
      }
    })
    .filter((row) => {
      return (
        row.reference_number ||
        row.first_name ||
        row.middle_name ||
        row.last_name ||
        row.email
      )
    })

  if (!parsedRows.length) {
    throw new Error("No readable rows were found in the file.")
  }

  return parsedRows
}