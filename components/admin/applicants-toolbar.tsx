"use client"

import { useRef, useState, useTransition } from "react"
import { Download, Plus, Search, Upload } from "lucide-react"
import * as XLSX from "xlsx"
import {
  bulkImportApplicants,
  getApplicantsForExport,
} from "@/app/admin/applicants/actions"
import { ApplicantModal } from "@/components/admin/applicant-modal"

export function ApplicantsToolbar({
  totalApplicants,
  latestApplicantName,
  query,
}: {
  totalApplicants: number
  latestApplicantName: string
  query: string
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const hiddenImportFormRef = useRef<HTMLFormElement>(null)

  const handleExport = async () => {
    const rows = await getApplicantsForExport()
    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Applicants")
    XLSX.writeFile(workbook, "applicants.xlsx")
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
              onClick={() => setOpen(true)}
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
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-[220px_220px_minmax(0,1fr)]">
          <div className="rounded-2xl bg-red-50 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-red-600">
              Total Applicants
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{totalApplicants}</p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Latest Applicant
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {latestApplicantName}
            </p>
          </div>

          <form>
            <label className="sr-only" htmlFor="q">
              Search applicants
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="q"
                name="q"
                defaultValue={query}
                placeholder="Search by name, reference number, or email"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
              />
            </div>
          </form>
        </div>

        <form
          ref={hiddenImportFormRef}
          action={bulkImportApplicants}
          className="hidden"
        >
          <input
            ref={fileInputRef}
            type="file"
            name="file"
            accept=".xlsx,.xls"
            onChange={(e) => {
              if (!e.currentTarget.files?.length) return
              const form = hiddenImportFormRef.current
              if (!form) return

              startTransition(() => {
                form.requestSubmit()
              })
            }}
          />
        </form>

        {isPending ? (
          <p className="mt-3 text-sm text-slate-500">Processing file...</p>
        ) : null}
      </div>

      <ApplicantModal open={open} onOpenChange={setOpen} />
    </>
  )
}