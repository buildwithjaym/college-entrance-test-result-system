import { FileSearch } from "lucide-react"

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-red-50 shadow-inner">
          <FileSearch className="h-14 w-14 text-red-600 animate-[float_2.5s_ease-in-out_infinite]" />
        </div>

        <h1 className="mt-6 text-xl font-bold text-slate-900">
          Preparing your result...
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Please wait while we load your official CET result.
        </p>

        <div className="mx-auto mt-6 h-2 w-48 overflow-hidden rounded-full bg-red-100">
          <div className="h-full w-2/3 animate-[progress_1.5s_ease-in-out_infinite] rounded-full bg-red-600" />
        </div>
      </div>
    </main>
  )
}