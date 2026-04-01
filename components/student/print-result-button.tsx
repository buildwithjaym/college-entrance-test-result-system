"use client"

import { Download, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PrintResultButton() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button
        type="button"
        onClick={() => window.print()}
        className="rounded-full px-5 shadow-md"
      >
        <Printer className="mr-2 h-4 w-4" />
        Print Result
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={() => window.print()}
        className="rounded-full border-primary/15 px-5"
      >
        <Download className="mr-2 h-4 w-4" />
        Download PDF
      </Button>
    </div>
  )
}