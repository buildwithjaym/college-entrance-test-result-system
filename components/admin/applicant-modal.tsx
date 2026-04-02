"use client"

import { useRef } from "react"
import { Loader2, Sparkles } from "lucide-react"
import { useFormStatus } from "react-dom"
import { createApplicant } from "@/app/admin/applicants/actions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-red-600 px-4 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
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

  async function action(formData: FormData) {
    await createApplicant(formData)
    formRef.current?.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl border border-slate-200 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Add new applicant
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Leave the reference number blank if you want the system to generate it automatically.
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
              className="h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
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
                className="h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Last Name
              </label>
              <input
                name="last_name"
                required
                className="h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Middle Name
            </label>
            <input
              name="middle_name"
              className="h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              name="email"
              type="email"
              className="h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
            />
          </div>

          <SubmitButton />
        </form>
      </DialogContent>
    </Dialog>
  )
}