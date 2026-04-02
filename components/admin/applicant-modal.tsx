"use client"

import { useRef, useState } from "react"
import { Loader2, Sparkles } from "lucide-react"
import { createApplicant } from "@/app/admin/applicants/actions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  dismissToast,
  showError,
  showLoading,
  showSuccess,
} from "@/lib/toast"

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-red-600 px-4 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saving...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Save Applicant
        </>
      )}
    </button>
  )
}

export function ApplicantModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (value: boolean) => void
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const [pending, setPending] = useState(false)

  async function action(formData: FormData) {
    const firstName = String(formData.get("first_name") ?? "").trim()
    const lastName = String(formData.get("last_name") ?? "").trim()
    const email = String(formData.get("email") ?? "").trim()

    if (!firstName) {
      showError("First name is required.")
      return
    }

    if (!lastName) {
      showError("Last name is required.")
      return
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError("Please enter a valid email address.")
      return
    }

    setPending(true)
    const toastId = showLoading("Saving applicant...")

    try {
      await createApplicant(formData)
      dismissToast(toastId)
      showSuccess("Applicant saved successfully.")
      formRef.current?.reset()
      onOpenChange(false)
    } catch (error) {
      dismissToast(toastId)
      showError(
        error instanceof Error ? error.message : "Failed to save applicant."
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(value) => !pending && onOpenChange(value)}>
      <DialogContent className="rounded-3xl border border-slate-200 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Add new applicant
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Leave the reference number blank if you want the system to generate
            it automatically.
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} action={action} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Reference Number
            </label>
            <input
              name="reference_number"
              placeholder="Auto-generate if left blank"
              disabled={pending}
              className="h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                First Name
              </label>
              <input
                name="first_name"
                required
                disabled={pending}
                className="h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Last Name
              </label>
              <input
                name="last_name"
                required
                disabled={pending}
                className="h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Middle Name
            </label>
            <input
              name="middle_name"
              disabled={pending}
              className="h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              name="email"
              type="email"
              disabled={pending}
              className="h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
          </div>

          <SubmitButton pending={pending} />
        </form>
      </DialogContent>
    </Dialog>
  )
}