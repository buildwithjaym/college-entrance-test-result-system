"use client"

import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Download,
  Eye,
  Loader2,
  Plus,
  Search,
  Upload,
  X,
} from "lucide-react"
import * as XLSX from "xlsx"
import {
  bulkImportApplicants,
  getApplicantsForExport,
  parseApplicantsExcel,
} from "@/app/admin/applicants/actions"
import { ApplicantModal } from "@/components/admin/applicant-modal"
import {
  dismissToast,
  showError,
  showInfo,
  showLoading,
  showSuccess,
} from "@/lib/toast"

type PreviewRow = {
  row_number: number
  reference_number: string
  first_name: string
  middle_name: string
  last_name: string
  email: string
  valid: boolean
  errors: string[]
}

export function ApplicantsToolbar({
  totalApplicants,
  latestApplicantName,
  query,
}: {
  totalApplicants: number
  latestApplicantName: string
  query: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([])
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewError, setPreviewError] = useState("")
  const [searchValue, setSearchValue] = useState(query)
  const [isParsing, startParsing] = useTransition()
  const [isImporting, startImporting] = useTransition()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const validRows = previewRows.filter((row) => row.valid)
  const invalidRows = previewRows.filter((row) => !row.valid)

  const handleExport = async () => {
    const toastId = showLoading("Preparing Excel export...")

    try {
      const rows = await getApplicantsForExport()
      const worksheet = XLSX.utils.json_to_sheet(rows)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Applicants")
      XLSX.writeFile(workbook, "applicants.xlsx")

      dismissToast(toastId)
      showSuccess("Applicants exported successfully.")
    } catch (error) {
      dismissToast(toastId)
      showError(
        error instanceof Error ? error.message : "Failed to export applicants."
      )
    }
  }

  const handleDownloadTemplate = () => {
    try {
      const templateData = [
        {
          reference_number: "",
          first_name: "Juan",
          middle_name: "Santos",
          last_name: "Dela Cruz",
          email: "juan@example.com",
        },
      ]

      const worksheet = XLSX.utils.json_to_sheet(templateData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Template")
      XLSX.writeFile(workbook, "applicants_template.xlsx")

      showSuccess("Template downloaded successfully.")
    } catch (error) {
      showError(
        error instanceof Error ? error.message : "Failed to download template."
      )
    }
  }

  const handleFileChange = (file: File | null) => {
    if (!file) return

    const toastId = showLoading("Reading Excel file...")

    startParsing(async () => {
      try {
        setPreviewError("")
        const formData = new FormData()
        formData.append("file", file)

        const result = await parseApplicantsExcel(formData)
        setPreviewRows(result)
        setPreviewOpen(true)

        dismissToast(toastId)

        if (result.length === 0) {
          showInfo("No rows found in the uploaded file.")
          return
        }

        showSuccess("Preview generated successfully.")
      } catch (error) {
        setPreviewRows([])
        setPreviewOpen(true)
        const message =
          error instanceof Error ? error.message : "Failed to preview file."

        setPreviewError(message)
        dismissToast(toastId)
        showError(message)
      }
    })
  }

  const handleConfirmImport = () => {
    if (!validRows.length) {
      showError("No valid rows available for import.")
      return
    }

    const toastId = showLoading("Importing applicants...")

    startImporting(async () => {
      const formData = new FormData()
      formData.append(
        "rows_json",
        JSON.stringify(
          validRows.map((row) => ({
            reference_number: row.reference_number,
            first_name: row.first_name,
            middle_name: row.middle_name,
            last_name: row.last_name,
            email: row.email,
          }))
        )
      )

      try {
        await bulkImportApplicants(formData)
        setPreviewRows([])
        setPreviewOpen(false)
        setPreviewError("")

        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }

        dismissToast(toastId)
        showSuccess(
          `${validRows.length} applicant${
            validRows.length > 1 ? "s" : ""
          } imported successfully.`
        )
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to import applicants."

        setPreviewError(message)
        dismissToast(toastId)
        showError(message)
      }
    })
  }

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmed = searchValue.trim()

    if (!trimmed) {
      router.push("/admin/applicants")
      showInfo("Showing all applicants.")
      return
    }

    router.push(`/admin/applicants?q=${encodeURIComponent(trimmed)}&page=1`)
    showSuccess(`Searching for "${trimmed}".`)
  }

  return (
    <>
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Applicants
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Register, search, import, export, and manage applicant records.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setOpen(true)
                showInfo("Add applicant form opened.")
              }}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-red-600 px-4 text-sm font-medium text-white transition hover:bg-red-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Applicant
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Upload className="mr-2 h-4 w-4" />
              Import Excel
            </button>

            <button
              type="button"
              onClick={handleExport}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Excel
            </button>

            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Download Template
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-[220px_220px_minmax(0,1fr)]">
          <div className="rounded-2xl bg-red-50 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-red-600">
              Total Applicants
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {totalApplicants}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Latest Applicant
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {latestApplicantName}
            </p>
          </div>

          <form onSubmit={handleSearchSubmit}>
            <label className="sr-only" htmlFor="q">
              Search applicants
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="q"
                name="q"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search by name, reference number, or email"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
              />
            </div>
          </form>
        </div>

        <div className="mt-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />

          <p className="text-xs text-slate-500">
            Use the template file to ensure correct format before importing.
          </p>

          {isParsing ? (
            <p className="mt-2 inline-flex items-center text-sm text-slate-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Preparing preview...
            </p>
          ) : null}
        </div>
      </div>

      <ApplicantModal open={open} onOpenChange={setOpen} />

      {previewOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[85vh] w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Import Preview
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Review the rows before saving them to the database.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPreviewOpen(false)
                  setPreviewRows([])
                  setPreviewError("")
                  showInfo("Import preview closed.")
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="rounded-full bg-white px-3 py-1 font-medium text-slate-700">
                  Total Rows: {previewRows.length}
                </span>
                <span className="rounded-full bg-green-100 px-3 py-1 font-medium text-green-700">
                  Valid: {validRows.length}
                </span>
                <span className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-700">
                  Invalid: {invalidRows.length}
                </span>
              </div>

              {previewError ? (
                <p className="mt-3 text-sm text-red-600">{previewError}</p>
              ) : null}
            </div>

            <div className="max-h-[50vh] overflow-auto p-5">
              {previewRows.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="pb-3 text-sm font-semibold text-slate-500">Row</th>
                        <th className="pb-3 text-sm font-semibold text-slate-500">Reference Number</th>
                        <th className="pb-3 text-sm font-semibold text-slate-500">First Name</th>
                        <th className="pb-3 text-sm font-semibold text-slate-500">Middle Name</th>
                        <th className="pb-3 text-sm font-semibold text-slate-500">Last Name</th>
                        <th className="pb-3 text-sm font-semibold text-slate-500">Email</th>
                        <th className="pb-3 text-sm font-semibold text-slate-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((row) => (
                        <tr
                          key={row.row_number}
                          className="border-b border-slate-100 last:border-b-0"
                        >
                          <td className="py-3 text-sm text-slate-700">{row.row_number}</td>
                          <td className="py-3 text-sm text-slate-700">
                            {row.reference_number || "Auto-generate"}
                          </td>
                          <td className="py-3 text-sm text-slate-700">{row.first_name || "—"}</td>
                          <td className="py-3 text-sm text-slate-700">{row.middle_name || "—"}</td>
                          <td className="py-3 text-sm text-slate-700">{row.last_name || "—"}</td>
                          <td className="py-3 text-sm text-slate-700">{row.email || "—"}</td>
                          <td className="py-3 text-sm">
                            {row.valid ? (
                              <span className="rounded-full bg-green-100 px-3 py-1 font-medium text-green-700">
                                Valid
                              </span>
                            ) : (
                              <div className="space-y-1">
                                <span className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-700">
                                  Invalid
                                </span>
                                <div className="text-xs text-red-600">
                                  {row.errors.join(", ")}
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                  No rows to preview.
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-500">
                Only valid rows will be imported.
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPreviewOpen(false)
                    setPreviewRows([])
                    setPreviewError("")
                    showInfo("Import cancelled.")
                  }}
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={!validRows.length || isImporting}
                  onClick={handleConfirmImport}
                  className="inline-flex h-11 items-center justify-center rounded-2xl bg-red-600 px-4 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Confirm Import
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}